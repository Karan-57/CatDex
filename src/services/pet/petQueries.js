import { getDb } from "../database/db";

/**
 * Returns the single pet row, or null if no pet has been created yet.
 * We use id=1 always, since the schema enforces only one pet can ever exist.
 */
export async function getPet() {
  const db = await getDb();
  const row = await db.getFirstAsync(`SELECT * FROM pet_state WHERE id = 1;`);
  return row || null;
}

/**
 * Creates the pet for the first time. Can only succeed once, since the
 * table's CHECK(id=1) constraint blocks a second row from ever existing.
 */
export async function createPet(name) {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO pet_state (id, name, happiness, hunger, last_updated, created_at)
     VALUES (1, ?, 100, 100, ?, ?);`,
    [name, now, now]
  );
  return await getPet();
}

/**
 * Updates the pet's stats (happiness/hunger) and refreshes last_updated.
 */
export async function updatePetStats(happiness, hunger) {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE pet_state SET happiness = ?, hunger = ?, last_updated = ? WHERE id = 1;`,
    [happiness, hunger, now]
  );
}