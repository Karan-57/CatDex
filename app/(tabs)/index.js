import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AppModal from "../../src/components/AppModal";
import PersonalCatSlot from "../../src/components/home/PersonalCatSlot";
import { COLORS, RADIUS, SPACING } from "../../src/constants/config";
import { useCats } from "../../src/hooks/useCats";
import { usePet } from "../../src/hooks/usePet";
import { DAILY_FISH_BONUS } from "../../src/services/pet/petConstants";

const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function HomeScreen() {
  const router = useRouter();
  const { cats, loading } = useCats();
  const { pet, dailyBonusClaimed, dismissDailyBonusNotice } = usePet();

  const recentCats = cats.slice(0, 5);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Status bar - now also shows fish token count top-right */}
      <View style={styles.statusBar}>
        <Text style={styles.statusBarText}>CatDex</Text>
        {pet && <Text style={styles.fishText}>🐟 {pet.fish_tokens}</Text>}
      </View>

      <View style={styles.personalCatCard}>
        <PersonalCatSlot />
      </View>

      <View style={styles.statsCard}>
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <Text style={styles.statsNumber}>{cats.length}</Text>
        )}
        <Text style={styles.statsLabel}>Cats Collected</Text>
      </View>

      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Recently Added</Text>
        {!loading && recentCats.length === 0 && (
          <Text style={styles.emptyText}>
            No cats yet — tap the + button below to add your first!
          </Text>
        )}
        {recentCats.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={styles.recentRow}
            onPress={() => router.push(`/cat/${cat.id}`)}
          >
            <Text style={styles.recentItem}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <AppModal
        visible={dailyBonusClaimed}
        title="Daily Bonus!"
        message={`You earned ${DAILY_FISH_BONUS} fish for opening CatDex today.`}
        onClose={dismissDailyBonusNotice}
        actions={[{ label: "Nice!", onPress: dismissDailyBonusNotice }]}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md },
  statusBar: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusBarText: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  fishText: { fontSize: 13, color: COLORS.text, fontWeight: "600" },
  personalCatCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
    height: SCREEN_HEIGHT * 1.0,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statsCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    alignItems: "center",
    marginBottom: SPACING.md,
    minHeight: 50,
    justifyContent: "center",
  },
  statsNumber: { fontSize: 20, fontWeight: "bold", color: COLORS.primary },
  statsLabel: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  recentSection: { marginTop: SPACING.md },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: SPACING.sm, color: COLORS.text },
  emptyText: { fontSize: 14, color: COLORS.textMuted, fontStyle: "italic" },
  recentRow: {
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  recentItem: { fontSize: 14, color: COLORS.text },
});