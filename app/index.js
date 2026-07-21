import { useRouter } from "expo-router";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, RADIUS, SPACING } from "../src/constants/config";
import { useCats } from "../src/hooks/useCats";

export default function HomeScreen() {
  const router = useRouter();
  const { cats, loading } = useCats();

  const recentCats = cats.slice(0, 5);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.personalCatCard}>
        <Text style={styles.personalCatText}>🐱 Personal Cat Coming Soon</Text>
      </View>

      <View style={styles.statsCard}>
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <Text style={styles.statsNumber}>{cats.length}</Text>
        )}
        <Text style={styles.statsLabel}>Cats Collected</Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={() => router.push("/camera")}>
          <Text style={styles.buttonText}>📷 Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => router.push("/camera?mode=gallery")}>
          <Text style={styles.buttonText}>🖼️ Gallery</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.wideButton} onPress={() => router.push("/catdex")}>
        <Text style={styles.buttonText}>📖 CatDex Collection</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.wideButton} onPress={() => router.push("/settings")}>
        <Text style={styles.buttonText}>⚙️ Settings</Text>
      </TouchableOpacity>

      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Recently Added</Text>
        {!loading && recentCats.length === 0 && (
          <Text style={styles.emptyText}>
            No cats yet — go find one and tap Camera to add your first!
          </Text>
        )}
        {recentCats.map((cat) => (
          <Text key={cat.id} style={styles.recentItem}>• {cat.name}</Text>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md },
  personalCatCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
    minHeight: 160,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  personalCatText: { fontSize: 16, color: COLORS.textMuted },
  statsCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: "center",
    marginBottom: SPACING.md,
    minHeight: 76,
    justifyContent: "center",
  },
  statsNumber: { fontSize: 32, fontWeight: "bold", color: COLORS.primary },
  statsLabel: { fontSize: 14, color: COLORS.textMuted, marginTop: SPACING.xs },
  buttonRow: { flexDirection: "row", gap: SPACING.sm, marginBottom: SPACING.sm },
  button: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: "center",
  },
  wideButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  recentSection: { marginTop: SPACING.md },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: SPACING.sm, color: COLORS.text },
  emptyText: { fontSize: 14, color: COLORS.textMuted, fontStyle: "italic" },
  recentItem: { fontSize: 14, color: COLORS.text, marginBottom: SPACING.xs },
});