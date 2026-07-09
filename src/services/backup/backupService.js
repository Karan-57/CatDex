import * as FileSystem from "expo-file-system/legacy";
import JSZip from "jszip";
import { DATABASE_NAME, STORAGE_FOLDERS } from "../../constants/config";

const baseDir = FileSystem.documentDirectory;

export async function exportBackup() {
  const zip = new JSZip();

  const dbFileUri = `${FileSystem.documentDirectory}SQLite/${DATABASE_NAME}`;
  const dbInfo = await FileSystem.getInfoAsync(dbFileUri);
  if (dbInfo.exists) {
    const dbContent = await FileSystem.readAsStringAsync(dbFileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    zip.file(DATABASE_NAME, dbContent, { base64: true });
  }

  for (const folder of [STORAGE_FOLDERS.ORIGINALS, STORAGE_FOLDERS.STICKERS]) {
    const dirUri = baseDir + folder + "/";
    const dirInfo = await FileSystem.getInfoAsync(dirUri);
    if (!dirInfo.exists) continue;

    const files = await FileSystem.readDirectoryAsync(dirUri);
    for (const filename of files) {
      const fileContent = await FileSystem.readAsStringAsync(dirUri + filename, {
        encoding: FileSystem.EncodingType.Base64,
      });
      zip.file(`${folder}/${filename}`, fileContent, { base64: true });
    }
  }

  const zipBase64 = await zip.generateAsync({ type: "base64" });
  const zipUri = `${FileSystem.cacheDirectory}catdex_backup.zip`;
  await FileSystem.writeAsStringAsync(zipUri, zipBase64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return zipUri;
}

export async function importBackup(zipUri) {
  const zipBase64 = await FileSystem.readAsStringAsync(zipUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const zip = await JSZip.loadAsync(zipBase64, { base64: true });

  const dbEntry = zip.file(DATABASE_NAME);
  if (dbEntry) {
    const dbContent = await dbEntry.async("base64");
    const sqliteDir = `${FileSystem.documentDirectory}SQLite/`;
    const dirInfo = await FileSystem.getInfoAsync(sqliteDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(sqliteDir, { intermediates: true });
    }
    await FileSystem.writeAsStringAsync(`${sqliteDir}${DATABASE_NAME}`, dbContent, {
      encoding: FileSystem.EncodingType.Base64,
    });
  }

  for (const folder of [STORAGE_FOLDERS.ORIGINALS, STORAGE_FOLDERS.STICKERS]) {
    const dirUri = baseDir + folder + "/";
    const dirInfo = await FileSystem.getInfoAsync(dirUri);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(dirUri, { intermediates: true });
    }

    const entries = Object.keys(zip.files).filter((name) => name.startsWith(`${folder}/`));
    for (const entryName of entries) {
      const entry = zip.file(entryName);
      if (!entry) continue;
      const content = await entry.async("base64");
      const filename = entryName.split("/").pop();
      await FileSystem.writeAsStringAsync(dirUri + filename, content, {
        encoding: FileSystem.EncodingType.Base64,
      });
    }
  }
}