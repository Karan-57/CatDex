import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { COLORS, RADIUS, SPACING } from "../../constants/config";
import { usePet } from "../../hooks/usePet";
import PetDisplay from "./PetDisplay";

/**
 * This is the single insertion point for the Personal Pet feature on the
 * Home screen. It decides between three states:
 *   1. Still loading pet data from DB -> render nothing (parent shows spinner)
 *   2. No pet created yet -> show a simple "name your pet" creation form
 *   3. Pet exists -> render the live PetDisplay (emotion image + stat bars)
 *
 * The Home screen itself never needs to know which of these is showing —
 * it just renders <PersonalCatSlot /> and this component handles the rest.
 */
export default function PersonalCatSlot() {
  const { pet, loading, initializePet } = usePet();
  const [nameInput, setNameInput] = useState("");
  const [creating, setCreating] = useState(false);

  async function handleCreatePet() {
    if (!nameInput.trim()) return;
    setCreating(true);
    await initializePet(nameInput.trim());
    setCreating(false);
  }

  if (loading) {
    return <View style={styles.card} />;
  }

  if (!pet) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>🐱 Meet Your Personal Cat</Text>
        <Text style={styles.subtitle}>Give your companion a name to begin</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter a name..."
          placeholderTextColor={COLORS.textMuted}
          value={nameInput}
          onChangeText={setNameInput}
        />
        <TouchableOpacity
          style={[styles.button, creating && styles.buttonDisabled]}
          onPress={handleCreatePet}
          disabled={creating}
        >
          <Text style={styles.buttonText}>{creating ? "Creating..." : "Adopt"}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <PetDisplay pet={pet} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: { fontSize: 18, fontWeight: "bold", color: COLORS.text, marginBottom: SPACING.xs },
  subtitle: { fontSize: 13, color: COLORS.textMuted, marginBottom: SPACING.md, textAlign: "center" },
  input: {
    width: "100%",
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    textAlign: "center",
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "600" },
});