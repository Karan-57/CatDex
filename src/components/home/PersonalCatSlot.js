import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { COLORS, RADIUS, SPACING } from "../../constants/config";
import { usePet } from "../../hooks/usePet";
import PetDisplay from "./PetDisplay";

export default function PersonalCatSlot() {
  const { pet, loading, renamePet } = usePet();
  const [showRename, setShowRename] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleRename() {
    if (!nameInput.trim()) return;
    setSaving(true);
    await renamePet(nameInput.trim());
    setSaving(false);
    setShowRename(false);
  }

  if (loading || !pet) {
    return <View style={styles.card} />;
  }

  if (showRename) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Name Your Cat</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter a name..."
          placeholderTextColor={COLORS.textMuted}
          value={nameInput}
          onChangeText={setNameInput}
        />
        <TouchableOpacity
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={handleRename}
          disabled={saving}
        >
          <Text style={styles.buttonText}>{saving ? "Saving..." : "Save Name"}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <PetDisplay pet={pet} />
      <TouchableOpacity style={styles.renameHint} onPress={() => setShowRename(true)}>
        <Text style={styles.renameHintText}>✏️ Rename</Text>
      </TouchableOpacity>
    </View>
  );
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
    height: "100%",
  },
  title: { fontSize: 18, fontWeight: "bold", color: COLORS.text, marginBottom: SPACING.md },
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
  renameHint: {
    position: "absolute",
    top: SPACING.xs,
    right: SPACING.xs,
    backgroundColor: COLORS.background,
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  renameHintText: { fontSize: 11, color: COLORS.textMuted },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "600" },
});
