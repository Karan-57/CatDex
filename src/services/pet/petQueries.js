import { getDb } from "../database/db";

/**
 * Returns the single pet row, or null if no pet has been created yet.
 * We always use id=1, since the schema's CHECK(id=1) guarantees only
 * one pet can ever exist.
 */
export async function getPet() {
  const db = await getDb();
  const row = await db.getFirstAsync(`SELECT * FROM pet_state WHERE id = 1;`);
  return row || null;
}

/**
 * Creates the pet for the first time (e.g. when the user names their
 * pet on first app launch). Can only succeed once — a second insert
 * with id=1 will fail due to the primary key constraint.
 */
export async function createPet(name) {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO pet_state
      (id, name, stage, level, xp, hunger, sleep, happiness, fish_tokens, last_updated, created_at)
     VALUES (1, ?, 'kitten', 1, 0, 100, 100, 100, 0, ?, ?);`,
    [name, now, now]
  );
  return await getPet();
}

/**
 * Generic updater for the pet's full state. Takes a partial object of
 * whichever fields changed and writes them all in one query. Always
 * refreshes last_updated so we can later calculate time-based decay
 * (e.g. "how many hours since last opened the app").
 */
export async function updatePetState(updates) {
  const db = await getDb();
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE pet_state
     SET name = ?, stage = ?, level = ?, xp = ?, hunger = ?, sleep = ?, happiness = ?, fish_tokens = ?, last_updated = ?
     WHERE id = 1;`,
    [
      updates.name,
      updates.stage,
      updates.level,
      updates.xp,
      updates.hunger,
      updates.sleep,
      updates.happiness,
      updates.fishTokens,
      now,
    ]
  );
}