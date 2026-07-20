import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, RADIUS, SPACING } from "../src/constants/config";

export default function CameraScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  // If opened with ?mode=gallery, skip camera and open gallery picker directly.
  React.useEffect(() => {
    if (mode === "gallery") {
      pickFromGallery();
    }
  }, [mode]);

  async function pickFromGallery() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) {
      goToPreview(result.assets[0].uri);
    } else {
      router.back();
    }
  }

  async function takePicture() {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      goToPreview(photo.uri);
    } catch (err) {
      Alert.alert("Camera Error", "Could not take photo. Please try again.");
    }
  }

  function goToPreview(uri) {
    router.replace({ pathname: "/sticker-preview", params: { imageUri: uri } });
  }

  if (mode === "gallery") {
    // Gallery picker is triggered via useEffect above; show nothing/loading here.
    return <View style={styles.container} />;
  }

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>We need camera access to photograph cats.</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" />
      <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
        <View style={styles.captureInner} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center" },
  camera: { flex: 1, width: "100%" },
  text: { color: "#fff", textAlign: "center", padding: SPACING.md },
  button: { backgroundColor: COLORS.primary, padding: SPACING.md, borderRadius: RADIUS.md, margin: SPACING.md },
  buttonText: { color: "#fff", fontWeight: "600" },
  captureButton: {
    position: "absolute",
    bottom: 40,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  captureInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.primary,
  },
});