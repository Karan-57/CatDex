import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import AppModal from "../../src/components/AppModal";
import EvolutionCelebration from "../../src/components/home/EvolutionCelebration";
import PersonalCatSlot, { PetControls } from "../../src/components/home/PersonalCatSlot";
import { COLORS, RADIUS, SPACING } from "../../src/constants/config";
import { useCats } from "../../src/hooks/useCats";
import { usePet } from "../../src/hooks/usePet";
import { DAILY_FISH_BONUS, xpRequiredForLevel } from "../../src/services/pet/petConstants";

export default function HomeScreen() {
  const { cats, loading } = useCats();
  const {
    pet,
    dailyBonusClaimed,
    dismissDailyBonusNotice,
    evolutionCelebration,
    dismissEvolutionCelebration,
  } = usePet();

  const xpNeeded = pet ? xpRequiredForLevel(pet.level) : 1;
  const xpProgress = pet ? Math.min(pet.xp / xpNeeded, 1) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Status bar now shows the pet's name/level/stage + XP bar,
            replacing the plain "CatDex" title. */}
        <View style={styles.statusBar}>
          {pet ? (
            <>
              <View style={styles.statusBarTopRow}>
                <Text style={styles.petName}>{pet.name}</Text>
                <Text style={styles.petLevel}>Lv. {pet.level}</Text>
                <Text style={styles.petStage}>
                  {pet.stage.charAt(0).toUpperCase() + pet.stage.slice(1)}
                </Text>
              </View>
              <View style={styles.xpBarTrack}>
                <View style={[styles.xpBarFill, { width: `${xpProgress * 100}%` }]} />
              </View>
            </>
          ) : (
            <Text style={styles.statusBarText}>CatDex</Text>
          )}
        </View>

        <View style={styles.personalCatCard}>
          <PersonalCatSlot />
        </View>

        {pet && (
          <View style={styles.petControlsCard}>
            <PetControls pet={pet} />
          </View>
        )}

        <View style={styles.statsCard}>
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Text style={styles.statsNumber}>{cats.length}</Text>
          )}
          <Text style={styles.statsLabel}>Cats Collected</Text>
        </View>
      </View>

      <AppModal
        visible={dailyBonusClaimed}
        title="Daily Bonus!"
        message={`You earned ${DAILY_FISH_BONUS} fish for opening CatDex today.`}
        onClose={dismissDailyBonusNotice}
        actions={[{ label: "Nice!", onPress: dismissDailyBonusNotice }]}
      />

      <EvolutionCelebration celebration={evolutionCelebration} onDismiss={dismissEvolutionCelebration} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, padding: SPACING.md },
  statusBar: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusBarText: { fontSize: 13, fontWeight: "600", color: COLORS.text, textAlign: "center" },
  statusBarTopRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  petName: { fontSize: 16, fontWeight: "bold", color: COLORS.text },
  petLevel: { fontSize: 13, color: COLORS.primary, fontWeight: "600" },
  petStage: { fontSize: 13, color: COLORS.textMuted, flex: 1, textAlign: "right" },
  xpBarTrack: {
    width: "100%",
    height: 5,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: "hidden",
    marginTop: SPACING.xs,
  },
  xpBarFill: { height: "100%", backgroundColor: COLORS.primary },
  personalCatCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  petControlsCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statsCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    alignItems: "center",
    minHeight: 50,
    justifyContent: "center",
  },
  statsNumber: { fontSize: 20, fontWeight: "bold", color: COLORS.primary },
  statsLabel: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
});