import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, RADIUS, SPACING } from "../../constants/config";

// Only kitten-stage evolving art exists today per your assets — this
// single image represents the "evolving" moment regardless of which
// stage transition occurred. When teen/adult art sets are added later,
// this can be extended to pick art based on `toStage`.
const EVOLVING_IMAGE = require("../../../assets/pet/kitten/evolving.png");

export default function EvolutionCelebration({ celebration, onDismiss }) {
  if (!celebration) return null;

  const { fromStage, toStage } = celebration;
  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>✨ Evolution! ✨</Text>
          <Image source={EVOLVING_IMAGE} style={styles.image} resizeMode="contain" />
          <Text style={styles.message}>
            Your cat evolved from {capitalize(fromStage)} to {capitalize(toStage)}!
          </Text>
          <TouchableOpacity style={styles.button} onPress={onDismiss}>
            <Text style={styles.buttonText}>Amazing!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
  },
  title: { fontSize: 22, fontWeight: "bold", color: COLORS.primary, marginBottom: SPACING.md },
  image: { width: "100%", height: 180, marginBottom: SPACING.md },
  message: { fontSize: 15, color: COLORS.text, textAlign: "center", marginBottom: SPACING.lg },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});