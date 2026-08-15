import { useRouter } from "expo-router";
import { Camera, Images } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, RADIUS, SPACING } from "../src/constants/config";

export default function AddCatChoiceScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add a New Cat</Text>
      <Text style={styles.subtitle}>How would you like to add a photo?</Text>

      <TouchableOpacity
        style={styles.optionButton}
        onPress={() => router.push("/camera")}
      >
        <Text style={styles.optionText}>
          <Camera size={22} color="#0d0d0d" /> Take a Photo</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.optionButton}
        onPress={() => router.push("/camera?mode=gallery")}
      >
        <Text style={styles.optionText}>
          <Images size={22} color="#0d0d0d" /> Choose from Gallery</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    marginBottom: SPACING.xl,
  },
  optionButton: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
});