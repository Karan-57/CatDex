import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AppModal from "../../src/components/AppModal";
import { COLORS, RADIUS, SPACING } from "../../src/constants/config";
import { useCats } from "../../src/hooks/useCats";
import { getCatById } from "../../src/services/database/catQueries";
import { getFullUri } from "../../src/services/storage/fileStorage";
import { formatDateForDisplay } from "../../src/utils/dateUtils";

export default function CatDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { removeCat } = useCats();
  const [cat, setCat] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const loadCat = useCallback(async () => {
    const data = await getCatById(Number(id));
    setCat(data);
  }, [id]);

  // useFocusEffect re-fetches every time this screen comes into view,
  // so edits made on EditCatScreen show up immediately when we come back.
  useFocusEffect(
    useCallback(() => {
      loadCat();
    }, [loadCat])
  );

  function handleDelete() {
    setShowDeleteModal(true);
  }

  async function confirmDelete() {
    setShowDeleteModal(false);
    await removeCat(cat);
    router.replace("/catdex");
  }

  if (!cat) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ padding: SPACING.md }}>
        <Image source={{ uri: getFullUri(cat.sticker_photo_path) }} style={styles.mainImage} />

        <Text style={styles.name}>{cat.is_favorite ? "★ " : ""}{cat.name}</Text>
        {!!cat.description && <Text style={styles.description}>{cat.description}</Text>}

        <Text style={styles.label}>Date Found</Text>
        <Text style={styles.value}>{formatDateForDisplay(cat.date_found)}</Text>

        {!!cat.notes && (
          <>
            <Text style={styles.label}>Notes</Text>
            <Text style={styles.value}>{cat.notes}</Text>
          </>
        )}

        <Text style={styles.label}>Original Photo</Text>
        <Image source={{ uri: getFullUri(cat.original_photo_path) }} style={styles.originalImage} />

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.editButton]}
            onPress={() => router.push(`/cat/${cat.id}/edit`)}
          >
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={handleDelete}
          >
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <AppModal
        visible={showDeleteModal}
        title="Delete Cat"
        message={`Are you sure you want to delete ${cat?.name}? This can't be undone.`}
        actions={[
          { label: "Cancel", style: "secondary", onPress: () => setShowDeleteModal(false) },
          { label: "Delete", style: "danger", onPress: confirmDelete },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingText: { textAlign: "center", marginTop: SPACING.xl, color: COLORS.textMuted },
  mainImage: { width: "100%", height: 220, borderRadius: RADIUS.md, backgroundColor: "#eee" },
  name: { fontSize: 24, fontWeight: "bold", color: COLORS.text, marginTop: SPACING.md },
  description: { fontSize: 15, color: COLORS.textMuted, marginTop: SPACING.xs },
  label: { fontSize: 13, fontWeight: "600", color: COLORS.textMuted, marginTop: SPACING.md },
  value: { fontSize: 15, color: COLORS.text, marginTop: SPACING.xs },
  originalImage: { width: "100%", height: 180, borderRadius: RADIUS.md, backgroundColor: "#eee", marginTop: SPACING.xs },
  buttonRow: { flexDirection: "row", gap: SPACING.sm, marginTop: SPACING.lg, marginBottom: SPACING.xl },
  button: { flex: 1, padding: SPACING.md, borderRadius: RADIUS.md, alignItems: "center" },
  editButton: { backgroundColor: COLORS.primary },
  deleteButton: { backgroundColor: COLORS.danger },
  buttonText: { color: "#fff", fontWeight: "600" },
});