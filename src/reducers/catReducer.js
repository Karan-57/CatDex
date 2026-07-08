export const initialState = {
  cats: [],
  loading: true,
};

export function catReducer(state, action) {
  switch (action.type) {
    case "SET_CATS":
      return { ...state, cats: action.payload, loading: false };
    case "ADD_CAT":
      return { ...state, cats: [action.payload, ...state.cats] };
    case "UPDATE_CAT":
      return {
        ...state,
        cats: state.cats.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      };
    case "DELETE_CAT":
      return {
        ...state,
        cats: state.cats.filter((c) => c.id !== action.payload),
      };
    default:
      return state;
  }
}