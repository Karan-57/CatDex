import { StyleSheet, Text, View } from "react-native";
import { COLORS, RADIUS, SPACING } from "../../constants/config";
import { usePet } from "../../hooks/usePet";

export default function FishHeaderBadge() {
  const { pet } = usePet();
  if (!pet) return null;

  return (
    <View style={styles.badge}>
      <Text style={styles.text}>🐟 {pet.fish_tokens}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: COLORS.background,
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginRight: SPACING.md,
  },
  text: { fontSize: 13, fontWeight: "600", color: COLORS.text },
});