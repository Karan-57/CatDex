import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, RADIUS, SPACING } from "../src/constants/config";
import { generateSticker } from "../src/services/ai/stickerService";

export default function StickerPreviewScreen() {
  const router = useRouter();
  const { imageUri } = useLocalSearchParams();
  const [stickerUri, setStickerUri] = useState(null);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    (async () => {
      const uri = await generateSticker(imageUri);
      setStickerUri(uri);
      setProcessing(false);
    })();
  }, [imageUri]);

  function confirmAndContinue() {
    router.push({
      pathname: "/save-cat",
      params: { originalUri: imageUri, stickerUri },
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Original</Text>
      <Image source={{ uri: imageUri }} style={styles.image} />

      <Text style={styles.label}>Sticker Preview</Text>
      {processing ? (
        <ActivityIndicator size="large" color={COLORS.primary} />
      ) : (
        <Image source={{ uri: stickerUri }} style={styles.image} />
      )}

      <TouchableOpacity
        style={[styles.button, processing && styles.buttonDisabled]}
        onPress={confirmAndContinue}
        disabled={processing}
      >
        <Text style={styles.buttonText}>Use This Sticker</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.md },
  label: { fontSize: 14, fontWeight: "600", color: COLORS.textMuted, marginTop: SPACING.sm },
  image: { width: "100%", height: 220, borderRadius: RADIUS.md, backgroundColor: "#eee", marginTop: SPACING.xs },
  button: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: "center",
    marginTop: SPACING.lg,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "600" },
});