import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView, Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text, TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AppModal from "../../../src/components/AppModal";
import { COLORS, RADIUS, SPACING } from "../../../src/constants/config";
import { useCats } from "../../../src/hooks/useCats";
import { getCatById } from "../../../src/services/database/catQueries";

export default function EditCatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { editCat } = useCats();

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [dateFound, setDateFound] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    (async () => {
      const cat = await getCatById(Number(id));
      setName(cat.name);
      setDescription(cat.description || "");
      setNotes(cat.notes || "");
      setDateFound(cat.date_found);
      setIsFavorite(cat.is_favorite === 1);
      setLoading(false);
    })();
  }, [id]);

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert("Missing Name", "Name can't be empty.");
      return;
    }
    setSaving(true);
    try {
      await editCat(Number(id), {
        name: name.trim(),
        description: description.trim(),
        notes: notes.trim(),
        dateFound,
        isFavorite,
      });
      setShowSuccessModal(true);
    } catch (err) {
      Alert.alert("Save Failed", err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={{ padding: SPACING.md }}>
        <Text style={styles.label}>Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />

        <Text style={styles.label}>One-word Description</Text>
        <TextInput style={styles.input} value={description} onChangeText={setDescription} />

        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <Text style={styles.label}>Date Found (YYYY-MM-DD)</Text>
        <TextInput style={styles.input} value={dateFound} onChangeText={setDateFound} />

        <View style={styles.favoriteRow}>
          <Text style={styles.label}>Favorite</Text>
          <Switch value={isFavorite} onValueChange={setIsFavorite} />
        </View>

        <TouchableOpacity
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.buttonText}>{saving ? "Saving..." : "Save Changes"}</Text>
        </TouchableOpacity>
      </ScrollView>
      <AppModal
        visible={showSuccessModal}
        title="Changes Saved"
        message="Your cat's details have been updated."
        actions={[
          {
            label: "OK",
            onPress: () => {
              setShowSuccessModal(false);
              router.back();
            },
          },
        ]}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingText: { textAlign: "center", marginTop: SPACING.xl, color: COLORS.textMuted },
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
  buttonText: { color: "#fff", fontWeight: "600" },
});