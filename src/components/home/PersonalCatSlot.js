import React from "react";
import { View } from "react-native";
import { COLORS, RADIUS } from "../../constants/config";
import { usePet } from "../../hooks/usePet";
import { PetControls, PetVisual } from "./PetDisplay";

export default function PersonalCatSlot() {
  const { pet, loading } = usePet();

  if (loading || !pet) {
    return <View style={{ height: "100%", backgroundColor: COLORS.card, borderRadius: RADIUS.lg }} />;
  }

  return <PetVisual pet={pet} />;
}

export { PetControls };
