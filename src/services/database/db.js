import * as SQLite from "expo-sqlite";
import { DATABASE_NAME } from "../../constants/config";

let dbInstance = null;

export async function getDb() {
  if (dbInstance) return dbInstance;
  dbInstance = await SQLite.openDatabaseAsync(DATABASE_NAME);
  return dbInstance;
}

export async function initDatabase() {
  const db = await getDb();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS cats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      notes TEXT,
      date_found TEXT NOT NULL,
      is_favorite INTEGER DEFAULT 0,
      original_photo_path TEXT NOT NULL,
      sticker_photo_path TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
}