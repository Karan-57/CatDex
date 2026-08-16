import { useEffect, useState } from "react";
import { Alert, Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
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

const ROOM_BACKGROUND = require("../../../assets/pet/room-background.jpg");

const ACTION_IMAGE_KEY = {
  feeding: "hungry",
  playing: "happy",
  sleeping: "sleepy",
};

/**
 * Pet's visual: room background + mood/action PNG layered on top.
 * Ticks every second so the pose correctly reverts once an action's
 * duration passes, without needing navigation or a manual refresh.
 */
export function PetVisual({ pet }) {
  const { playWithPet } = usePet();

  const [, forceTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => forceTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const activeAction = getActiveAction(pet);
  const emotion = activeAction ? ACTION_IMAGE_KEY[activeAction] : deriveEmotion(pet);
  const stageImages = PET_IMAGES[pet.stage] || PET_IMAGES.kitten;
  const imageSource = stageImages[emotion] || stageImages.content;

  // Petting is a SWIPE across the cat, not a tap - detected via a pan
  // gesture. We trigger playWithPet() once per swipe gesture (on
  // completion), not continuously while dragging, so it respects the
  // same cooldown/action rules as the Play button without spamming.
  const petGesture = Gesture.Pan()
    .minDistance(20)
    .onEnd(() => {
      playWithPet();
    });

  return (
    <GestureDetector gesture={petGesture}>
      <ImageBackground
        source={ROOM_BACKGROUND}
        style={styles.visualWrapper}
        imageStyle={{ borderRadius: RADIUS.lg }}
      >
        <Image source={imageSource} style={styles.petImage} resizeMode="contain" />
      </ImageBackground>
    </GestureDetector>
  );
}
/**
 * Stats bars + Feed/Play/Sleep buttons. Each button is disabled ONLY
 * by its OWN cooldown/active-action state — not by whether a different
 * action is currently running. Feeding doesn't block Play, etc.
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

  // Each button's disabled state is independent: only true if THIS
  // specific action is the one currently running, OR this specific
  // action is on its own cooldown.
  const feedDisabled = activeAction === "feeding" || isActionOnCooldown(pet, "feeding");
  const playDisabled = activeAction === "playing" || isActionOnCooldown(pet, "playing");
  const sleepDisabled = activeAction === "sleeping" || isActionOnCooldown(pet, "sleeping");

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
    justifyContent: "center",
    alignItems: "center",
  },
  // Increased from the previous 35%/30% - this is the value to tune
  // if you want the cat bigger or smaller relative to its card.
  petImage: { width: "75%", height: "70%", marginTop:"30px" },////cats margin
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