import React, { useEffect, useState } from "react";
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, RADIUS, SPACING } from "../../constants/config";
import { usePet } from "../../hooks/usePet";
import { xpRequiredForLevel } from "../../services/pet/petConstants";
import { deriveEmotion, getActiveAction, isActionOnCooldown } from "../../services/pet/petLogic";

const PET_IMAGES = {
  kitten: {
    content: require("../../../assets/pet/kitten/content.png"),
    happy: require("../../../assets/pet/kitten/happy.png"),
    sad: require("../../../assets/pet/kitten/sad.png"),
    sleepy: require("../../../assets/pet/kitten/sleepy.png"),
    hungry: require("../../../assets/pet/kitten/hungry.png"),
  },
};

// Maps an active action name to which existing image represents it,
// per your mapping: feeding -> hungry.png, playing -> happy.png,
// sleeping -> sleepy.png. Swap these for dedicated art anytime later.
const ACTION_IMAGE_KEY = {
  feeding: "hungry",
  playing: "happy",
  sleeping: "sleepy",
};

export default function PetDisplay({ pet, onRenamePress }) {
  const { feedPet, playWithPet, putPetToSleep } = usePet();

  // Re-check every second so the pose correctly reverts the moment an
  // action expires, and cooldown-based button states update live,
  // without needing the user to reopen the screen.
  const [, forceTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => forceTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const activeAction = getActiveAction(pet);
  const emotion = activeAction ? ACTION_IMAGE_KEY[activeAction] : deriveEmotion(pet);
  const stageImages = PET_IMAGES[pet.stage] || PET_IMAGES.kitten;
  const imageSource = stageImages[emotion] || stageImages.content;

  const xpNeeded = xpRequiredForLevel(pet.level);
  const xpProgress = Math.min(pet.xp / xpNeeded, 1);

  async function handleFeed() {
    const success = await feedPet();
    if (!success) {
      Alert.alert(
        "Can't Feed Right Now",
        `Either you're out of fish, or your cat needs to rest before eating again.`
      );
    }
  }

  async function handlePlay() {
    const success = await playWithPet();
    if (!success) {
      Alert.alert("Not Ready to Play", "Your cat needs a break before playing again.");
    }
  }

  async function handleSleep() {
    const success = await putPetToSleep();
    if (!success) {
      Alert.alert("Not Sleepy Yet", "Your cat isn't ready to sleep again so soon.");
    }
  }

  const isBusy = !!activeAction;
  const feedDisabled = isBusy || isActionOnCooldown(pet, "feeding");
  const playDisabled = isBusy || isActionOnCooldown(pet, "playing");
  const sleepDisabled = isBusy || isActionOnCooldown(pet, "sleeping");

  return (
    <View style={styles.wrapper}>
      <View style={styles.infoRow}>
        <Text style={styles.name}>{pet.name}</Text>
        <Text style={styles.level}>Lv. {pet.level}</Text>
        <Text style={styles.stage}>{pet.stage.charAt(0).toUpperCase() + pet.stage.slice(1)}</Text>
        <TouchableOpacity onPress={onRenamePress} style={styles.renameIcon}>
          <Text style={styles.renameIconText}>✏️</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.xpBarTrack}>
        <View style={[styles.xpBarFill, { width: `${xpProgress * 100}%` }]} />
      </View>

      <Image source={imageSource} style={styles.petImage} resizeMode="contain" />

      <View style={styles.statsRow}>
        <StatBar label="Hunger" value={pet.hunger} color={COLORS.warning} />
        <StatBar label="Sleep" value={pet.sleep} color={COLORS.secondary} />
        <StatBar label="Happy" value={pet.happiness} color={COLORS.success} />
      </View>

      <View style={styles.actionRow}>
        <ActionButton label="Feed" onPress={handleFeed} disabled={feedDisabled} />
        <ActionButton label="Play" onPress={handlePlay} disabled={playDisabled} />
        <ActionButton label="Sleep" onPress={handleSleep} disabled={sleepDisabled} />
      </View>
    </View>
  );
}

function StatBar({ label, value, color }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statTrack}>
        <View style={[styles.statFill, { width: `${value}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

function ActionButton({ label, onPress, disabled }) {
  return (
    <TouchableOpacity
      style={[styles.actionButton, disabled && styles.actionButtonDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.actionButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: "100%", height: "100%", justifyContent: "space-between" },
  infoRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  name: { fontSize: 18, fontWeight: "bold", color: COLORS.text },
  level: { fontSize: 14, color: COLORS.primary, fontWeight: "600" },
  stage: { fontSize: 14, color: COLORS.textMuted, flex: 1 },
  renameIcon: { padding: 4 },
  renameIconText: { fontSize: 16 },
  xpBarTrack: {
    width: "100%",
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: "hidden",
    marginTop: SPACING.xs,
  },
  xpBarFill: { height: "100%", backgroundColor: COLORS.primary },
  petImage: { width: "100%", height: "55%" },
  statsRow: { flexDirection: "row", width: "100%", justifyContent: "space-between", gap: SPACING.sm },
  statItem: { flex: 1, alignItems: "center" },
  statLabel: { fontSize: 11, color: COLORS.textMuted, marginBottom: 2 },
  statTrack: {
    width: "100%",
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  statFill: { height: "100%" },
  actionRow: { flexDirection: "row", gap: SPACING.sm, justifyContent: "center" },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
  },
  actionButtonDisabled: { opacity: 0.4 },
  actionButtonText: { color: "#fff", fontWeight: "600", fontSize: 13 },
});