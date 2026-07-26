import { useContext } from "react";
import { PetContext } from "../context/PetContext";

export function usePet() {
  const context = useContext(PetContext);
  if (!context) {
    throw new Error("usePet must be used inside a PetProvider");
  }
  return context;
}
