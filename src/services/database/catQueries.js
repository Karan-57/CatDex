import { getDb } from "./db";

export async function insertCat(cat) {
  const db = await getDb();
  const createdAt = new Date().toISOString();
  const result = await db.runAsync(
    `INSERT INTO cats (name, description, notes, date_found, is_favorite, original_photo_path, sticker_photo_path, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    [cat.name, cat.description, cat.notes, cat.dateFound, cat.isFavorite ? 1 : 0, cat.originalPhotoPath, cat.stickerPhotoPath, createdAt]
  );
  return result.lastInsertRowId;
}

export async function getAllCats() {
  const db = await getDb();
  return await db.getAllAsync(`SELECT * FROM cats ORDER BY created_at DESC;`);
}

export async function getCatById(id) {
  const db = await getDb();
  return await db.getFirstAsync(`SELECT * FROM cats WHERE id = ?;`, [id]);
}

export async function updateCat(id, updates) {
  const db = await getDb();
  await db.runAsync(
    `UPDATE cats SET name=?, description=?, notes=?, date_found=?, is_favorite=? WHERE id=?;`,
    [updates.name, updates.description, updates.notes, updates.dateFound, updates.isFavorite ? 1 : 0, id]
  );
}

export async function deleteCat(id) {
  const db = await getDb();
  await db.runAsync(`DELETE FROM cats WHERE id = ?;`, [id]);
}

export async function searchCats(term) {
  const db = await getDb();
  const p = `%${term}%`;
  return await db.getAllAsync(`SELECT * FROM cats WHERE name LIKE ? OR description LIKE ? ORDER BY created_at DESC;`, [p, p]);
}

export async function getFavoriteCats() {
  const db = await getDb();
  return await db.getAllAsync(`SELECT * FROM cats WHERE is_favorite = 1 ORDER BY created_at DESC;`);
}