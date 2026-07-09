import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, GOOGLE_CLIENT_ID, RADIUS, SPACING } from "../src/constants/config";
import { exportBackup, importBackup } from "../src/services/backup/backupService";
import { downloadBackupFromDrive, uploadBackupToDrive } from "../src/services/backup/googleDriveService";

WebBrowser.maybeCompleteAuthSession();

export default function SettingsScreen() {
  const [busy, setBusy] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    scopes: ["https://www.googleapis.com/auth/drive.file"],
  });

  async function getAccessToken() {
    const result = await promptAsync();
    if (result.type !== "success") {
      throw new Error("Google sign-in was cancelled or failed.");
    }
    return result.authentication.accessToken;
  }

  async function handleExport() {
    setBusy(true);
    try {
      const accessToken = await getAccessToken();
      const zipUri = await exportBackup();
      await uploadBackupToDrive(accessToken, zipUri);
      Alert.alert("Backup Complete", "Your backup was uploaded to Google Drive.");
    } catch (err) {
      Alert.alert("Export Failed", err.message);
    }
    setBusy(false);
  }

  async function handleImport() {
    setBusy(true);
    try {
      const accessToken = await getAccessToken();
      const localZipUri = await downloadBackupFromDrive(accessToken);
      await importBackup(localZipUri);
      Alert.alert("Import Complete", "Please restart the app to see restored data.");
    } catch (err) {
      Alert.alert("Import Failed", err.message);
    }
    setBusy(false);
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleExport} disabled={busy}>
        <Text style={styles.buttonText}>Export Backup to Google Drive</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleImport} disabled={busy}>
        <Text style={styles.buttonText}>Import Backup from Google Drive</Text>
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>CatDex</Text>
        <Text style={styles.infoText}>Version 1.0.0</Text>
        <Text style={styles.infoText}>Backups are stored in your own Google Drive.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.md },
  button: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  infoBox: { marginTop: SPACING.xl, alignItems: "center" },
  infoTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.text },
  infoText: { fontSize: 13, color: COLORS.textMuted, marginTop: SPACING.xs },
});