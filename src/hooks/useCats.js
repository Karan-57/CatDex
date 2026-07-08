import { useContext } from "react";
import { CatContext } from "../context/CatContext";

export function useCats() {
  const context = useContext(CatContext);
  if (!context) {
    throw new Error("useCats must be used inside a CatProvider");
  }
  return context;
}