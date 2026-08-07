export const initialPetState = {
  pet: null, // null until the user creates their pet for the first time
  loading: true,
};

export function petReducer(state, action) {
  switch (action.type) {
    case "SET_PET":
      return { ...state, pet: action.payload, loading: false };
    case "UPDATE_PET":
      return { ...state, pet: action.payload };
    default:
      return state;
  }
}