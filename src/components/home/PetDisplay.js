import { Image, StyleSheet, Text, View } from "react-native";
import { COLORS, RADIUS, SPACING } from "../../constants/config";
import { xpRequiredForLevel } from "../../services/pet/petConstants";
import { deriveEmotion } from "../../services/pet/petLogic";

// Static require() map — React Native needs image sources to be resolvable
// at bundle time, so this can't be built dynamically from a string.
// Adding teen/adult art later just means adding more entries here.
const PET_IMAGES = {
  kitten: {
    content: require("../../../assets/pet/kitten/content.png"),
    happy: require("../../../assets/pet/kitten/happy.png"),
    sad: require("../../../assets/pet/kitten/sad.png"),
    sleepy: require("../../../assets/pet/kitten/sleepy.png"),
    hungry: require("../../../assets/pet/kitten/hungry.png"),
  },
};

export default function PetDisplay({ pet }) {
  const emotion = deriveEmotion(pet);
  const stageImages = PET_IMAGES[pet.stage] || PET_IMAGES.kitten;
  const imageSource = stageImages[emotion] || stageImages.content;

  const xpNeeded = xpRequiredForLevel(pet.level);
  const xpProgress = Math.min(pet.xp / xpNeeded, 1);

  return (
    <View style={styles.card}>
      <Image source={imageSource} style={styles.petImage} resizeMode="contain" />

      <Text style={styles.name}>{pet.name}</Text>
      <Text style={styles.levelText}>
        Lv. {pet.level} · {pet.stage.charAt(0).toUpperCase() + pet.stage.slice(1)}
      </Text>

      <View style={styles.xpBarTrack}>
        <View style={[styles.xpBarFill, { width: `${xpProgress * 100}%` }]} />
      </View>

      <View style={styles.statsRow}>
        <StatBar label="Hunger" value={pet.hunger} color={COLORS.warning} />
        <StatBar label="Sleep" value={pet.sleep} color={COLORS.secondary} />
        <StatBar label="Happy" value={pet.happiness} color={COLORS.success} />
      </View>

      <Text style={styles.fishText}>🐟 {pet.fish_tokens}</Text>
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    height: "100%",
    justifyContent: "center",
  },
  petImage: { width: "70%", height: "50%" },
  name: { fontSize: 20, fontWeight: "bold", color: COLORS.text, marginTop: SPACING.sm },
  levelText: { fontSize: 13, color: COLORS.textMuted, marginBottom: SPACING.sm },
  xpBarTrack: {
    width: "80%",
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: SPACING.md,
  },
  xpBarFill: { height: "100%", backgroundColor: COLORS.primary },
  statsRow: { flexDirection: "row", width: "90%", justifyContent: "space-between", gap: SPACING.sm },
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
  fishText: { marginTop: SPACING.sm, fontSize: 13, color: COLORS.text },
});