import * as FileSystem from "expo-file-system";

const baseDir = FileSystem.documentDirectory;

async function ensureFolderExists(folderName) {
  const dir = baseDir + folderName + "/";
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
  return dir;
}

// Copies a temp image URI (from camera/picker) into permanent storage.
// Returns a RELATIVE path (folder/filename.jpg) to store in the DB.
export async function saveImageToStorage(tempUri, folderName) {
  const dir = await ensureFolderExists(folderName);
  const filename = `${Date.now()}.jpg`;
  const destUri = dir + filename;
  await FileSystem.copyAsync({ from: tempUri, to: destUri });
  return `${folderName}/${filename}`;
}

// Converts a relative path stored in DB back into a full usable URI for <Image>.
export function getFullUri(relativePath) {
  if (!relativePath) return null;
  return baseDir + relativePath;
}

// Deletes a file given its relative path (used when deleting a cat).
export async function deleteImageFromStorage(relativePath) {
  if (!relativePath) return;
  const fullUri = baseDir + relativePath;
  const info = await FileSystem.getInfoAsync(fullUri);
  if (info.exists) {
    await FileSystem.deleteAsync(fullUri);
  }
}