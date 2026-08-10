import React, { useEffect, useState } from "react";
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, RADIUS, SPACING } from "../../constants/config";
import { usePet } from "../../hooks/usePet";
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

const ACTION_IMAGE_KEY = {
  feeding: "hungry",
  playing: "happy",
  sleeping: "sleepy",
};

// Uncomment once you've added the background image file:
// const ROOM_BACKGROUND = require("../../../assets/pet/room-background.jpg");

/**
 * Just the pet's visual (background room + mood PNG + rename icon).
 * Stats and action buttons now live in a separate PetControls component,
 * rendered in its own container below this one.
 */
export function PetVisual({ pet, onRenamePress }) {
  const [, forceTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => forceTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const activeAction = getActiveAction(pet);
  const emotion = activeAction ? ACTION_IMAGE_KEY[activeAction] : deriveEmotion(pet);
  const stageImages = PET_IMAGES[pet.stage] || PET_IMAGES.kitten;
  const imageSource = stageImages[emotion] || stageImages.content;

  return (
    <View style={styles.visualWrapper}>
      <TouchableOpacity onPress={onRenamePress} style={styles.renameIcon}>
        <Text style={styles.renameIconText}>✏️</Text>
      </TouchableOpacity>
      <Image source={imageSource} style={styles.petImage} resizeMode="contain" />
    </View>
  );
}

/**
 * Stats bars + Feed/Play/Sleep buttons, rendered in a separate card
 * below the pet visual. Still needs `pet` since it reads hunger/sleep/
 * happiness and cooldown state directly.
 */
export function PetControls({ pet }) {
  const { feedPet, playWithPet, putPetToSleep } = usePet();

  const [, forceTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => forceTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const activeAction = getActiveAction(pet);

  async function handleFeed() {
    const success = await feedPet();
    if (!success) {
      Alert.alert(
        "Can't Feed Right Now",
        "Either you're out of fish, or your cat needs to rest before eating again."
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
    <View style={styles.controlsWrapper}>
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
  visualWrapper: {
    width: "100%",
    height: "100%",
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  renameIcon: {
    position: "absolute",
    top: SPACING.xs,
    right: SPACING.xs,
    padding: 4,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.sm,
    zIndex: 1,
  },
  renameIconText: { fontSize: 16 },
  // Pet PNG shrunk to roughly half its previous relative size, reducing
  // empty space now that it's layered over a full-scene background.
  petImage: { width: "35%", height: "30%" },
  controlsWrapper: { width: "100%" },
  statsRow: { flexDirection: "row", width: "100%", justifyContent: "space-between", gap: SPACING.sm, marginBottom: SPACING.sm },
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