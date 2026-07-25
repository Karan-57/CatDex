import { removeBackground } from "@six33/react-native-bg-removal";
import * as ImageManipulator from "expo-image-manipulator";

/**
 * Takes a photo URI and returns a real cutout sticker — background
 * removed using on-device ML (MLKit on Android, Vision on iOS), fully
 * offline. Falls back to a simple resize if bg removal fails for any
 * reason (e.g. unsupported device), so saving a cat never hard-fails.
 */
export async function generateSticker(imageUri) {
  try {
    const cutoutUri = await removeBackground(imageUri, { trim: true });
    return cutoutUri;
  } catch (err) {
    console.warn("Background removal failed, falling back to plain resize:", err.message);
    const fallback = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 800 } }],
      { format: ImageManipulator.SaveFormat.PNG, compress: 0.9 }
    );
    return fallback.uri;
  }
}