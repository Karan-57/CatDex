import * as FileSystem from "expo-file-system/legacy";
import { GOOGLE_DRIVE_BACKUP_FILENAME } from "../../constants/config";

const DRIVE_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files";
const DRIVE_FILES_URL = "https://www.googleapis.com/drive/v3/files";

/**
 * Searches the user's Google Drive (app-created files only, since we
 * request the "drive.file" scope) for our backup zip.
 * Returns the file's Drive ID, or null if no backup exists yet.
 */
async function findBackupFileId(accessToken) {
  const query = encodeURIComponent(`name='${GOOGLE_DRIVE_BACKUP_FILENAME}' and trashed=false`);
  const response = await fetch(`${DRIVE_FILES_URL}?q=${query}&spaces=drive`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await response.json();
  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }
  return null;
}

/**
 * Uploads a local zip file to Google Drive. If a backup already exists,
 * it overwrites (updates) it instead of creating duplicates.
 */
export async function uploadBackupToDrive(accessToken, localZipUri) {
  const zipBase64 = await FileSystem.readAsStringAsync(localZipUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const zipBinary = base64ToBinaryString(zipBase64);

  const existingFileId = await findBackupFileId(accessToken);

  const metadata = { name: GOOGLE_DRIVE_BACKUP_FILENAME, mimeType: "application/zip" };
  const boundary = "catdex_boundary";
  const body =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: application/zip\r\n\r\n` +
    `${zipBinary}\r\n` +
    `--${boundary}--`;

  const url = existingFileId
    ? `${DRIVE_UPLOAD_URL}/${existingFileId}?uploadType=multipart`
    : `${DRIVE_UPLOAD_URL}?uploadType=multipart`;

  const response = await fetch(url, {
    method: existingFileId ? "PATCH" : "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": `multipart/related; boundary=${boundary}`,
    },
    body,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Drive upload failed: ${errText}`);
  }
  return await response.json();
}

/**
 * Downloads the backup zip from Drive into local cache storage,
 * returns the local file URI so importBackup() can use it.
 */
export async function downloadBackupFromDrive(accessToken) {
  const fileId = await findBackupFileId(accessToken);
  if (!fileId) {
    throw new Error("No backup found on Google Drive.");
  }

  const response = await fetch(`${DRIVE_FILES_URL}/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const arrayBuffer = await response.arrayBuffer();
  const base64 = arrayBufferToBase64(arrayBuffer);

  const localUri = `${FileSystem.cacheDirectory}downloaded_backup.zip`;
  await FileSystem.writeAsStringAsync(localUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return localUri;
}

// --- Small binary/base64 helpers (no extra library needed for these) ---

function base64ToBinaryString(base64) {
  const binaryString = atob(base64);
  return binaryString;
}

function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}