import * as ImageManipulator from "expo-image-manipulator";

/**
 * Takes a photo URI and returns a "sticker-ified" version.
 * Current free implementation: crop to square + resize + return as PNG.
 * This does NOT do real background removal (that needs a paid API or
 * on-device ML model). It's a placeholder pipeline so the rest of the
 * app never needs to change when real bg-removal is added later —
 * only this function's internals get replaced.
 */
export async function generateSticker(imageUri) {
  const result = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width: 800 } }],
    { format: ImageManipulator.SaveFormat.PNG, compress: 0.9 }
  );
  return result.uri;
}