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

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS pet_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT NOT NULL,
      stage TEXT NOT NULL DEFAULT 'kitten',
      level INTEGER NOT NULL DEFAULT 1,
      xp INTEGER NOT NULL DEFAULT 0,
      hunger INTEGER NOT NULL DEFAULT 100,
      sleep INTEGER NOT NULL DEFAULT 100,
      happiness INTEGER NOT NULL DEFAULT 100,
      fish_tokens INTEGER NOT NULL DEFAULT 0,
      current_action TEXT,
      action_end_time TEXT,
      feed_cooldown_end TEXT,
      play_cooldown_end TEXT,
      sleep_cooldown_end TEXT,
      last_updated TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // Migration: add any columns missing on existing installs.
  const tableInfo = await db.getAllAsync(`PRAGMA table_info(pet_state);`);
  const existingColumns = tableInfo.map((col) => col.name);
  const requiredColumns = {
    current_action: "TEXT",
    action_end_time: "TEXT",
    feed_cooldown_end: "TEXT",
    play_cooldown_end: "TEXT",
    sleep_cooldown_end: "TEXT",
  };
  for (const [columnName, columnType] of Object.entries(requiredColumns)) {
    if (!existingColumns.includes(columnName)) {
      await db.execAsync(`ALTER TABLE pet_state ADD COLUMN ${columnName} ${columnType};`);
    }
  }
}