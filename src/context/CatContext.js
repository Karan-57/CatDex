import { createContext, useEffect, useReducer } from "react";
import { catReducer, initialState } from "../reducers/catReducer";
import {
    deleteCat as deleteCatQuery,
    getAllCats,
    insertCat,
    updateCat as updateCatQuery,
} from "../services/database/catQueries";
import { initDatabase } from "../services/database/db";
import { deleteImageFromStorage } from "../services/storage/fileStorage";

export const CatContext = createContext(null);

export function CatProvider({ children }) {
  const [state, dispatch] = useReducer(catReducer, initialState);

  useEffect(() => {
    (async () => {
      await initDatabase();
      const cats = await getAllCats();
      dispatch({ type: "SET_CATS", payload: cats });
    })();
  }, []);

  async function addCat(catData) {
    const id = await insertCat(catData);
    const newCat = { id, ...mapToDbShape(catData) };
    dispatch({ type: "ADD_CAT", payload: newCat });
    return id;
  }

  async function editCat(id, updates) {
    await updateCatQuery(id, updates);
    const updated = { id, ...mapToDbShape(updates) };
    dispatch({ type: "UPDATE_CAT", payload: updated });
  }

  async function removeCat(cat) {
    await deleteCatQuery(cat.id);
    await deleteImageFromStorage(cat.original_photo_path);
    await deleteImageFromStorage(cat.sticker_photo_path);
    dispatch({ type: "DELETE_CAT", payload: cat.id });
  }

  // Converts camelCase fields (used in JS objects) to snake_case
  // (used in DB rows) so context state matches what getAllCats() returns.
  function mapToDbShape(data) {
    return {
      name: data.name,
      description: data.description,
      notes: data.notes,
      date_found: data.dateFound,
      is_favorite: data.isFavorite ? 1 : 0,
      original_photo_path: data.originalPhotoPath,
      sticker_photo_path: data.stickerPhotoPath,
    };
  }

  return (
    <CatContext.Provider
      value={{ ...state, addCat, editCat, removeCat }}
    >
      {children}
    </CatContext.Provider>
  );
}