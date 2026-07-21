import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView, Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text, TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import AppModal from "../src/components/AppModal";
import { COLORS, RADIUS, SPACING, STORAGE_FOLDERS } from "../src/constants/config";
import { useCats } from "../src/hooks/useCats";
import { saveImageToStorage } from "../src/services/storage/fileStorage";
import { todayString } from "../src/utils/dateUtils";

export default function SaveCatScreen() {
  const router = useRouter();
  const { originalUri, stickerUri } = useLocalSearchParams();
  const { addCat } = useCats();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

async function handleSave() {
  if (!name.trim()) {
    Alert.alert("Missing Name", "Please enter a name for this cat.");
    return;
  }
  setSaving(true);
  try {
    const originalPath = await saveImageToStorage(originalUri, STORAGE_FOLDERS.ORIGINALS);
    const stickerPath = await saveImageToStorage(stickerUri, STORAGE_FOLDERS.STICKERS);

    await addCat({
      name: name.trim(),
      description: description.trim(),
      notes: notes.trim(),
      dateFound: todayString(),
      isFavorite,
      originalPhotoPath: originalPath,
      stickerPhotoPath: stickerPath,
    });

    setShowSuccessModal(true);
  } catch (err) {
    Alert.alert("Save Failed", err.message);
  } finally {
    setSaving(false);
  }
}

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={{ padding: SPACING.md }}>
        <Image source={{ uri: stickerUri }} style={styles.preview} />

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Whiskers"
        />

        <Text style={styles.label}>One-word Description</Text>
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          placeholder="e.g. Fluffy"
        />

        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Anything memorable about this cat..."
          multiline
        />

        <View style={styles.favoriteRow}>
          <Text style={styles.label}>Favorite</Text>
          <Switch value={isFavorite} onValueChange={setIsFavorite} />
        </View>

        <TouchableOpacity
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.buttonText}>{saving ? "Saving..." : "Save Cat"}</Text>
        </TouchableOpacity>
      </ScrollView>
      <AppModal
        visible={showSuccessModal}
        title="Cat Saved"
        message={`${name.trim()} has been added to your CatDex.`}
        actions={[
          {
            label: "OK",
            onPress: () => {
              setShowSuccessModal(false);
              router.replace("/");
            },
          },
        ]}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  preview: { width: "100%", height: 200, borderRadius: RADIUS.md, backgroundColor: "#eee", marginBottom: SPACING.md },
  label: { fontSize: 14, fontWeight: "600", color: COLORS.text, marginTop: SPACING.sm, marginBottom: SPACING.xs },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 15,
  },
  notesInput: { height: 80, textAlignVertical: "top" },
  favoriteRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: SPACING.md },
  button: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: "center",
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});