import { getDb } from "../database/db";

export async function getPet() {
  const db = await getDb();
  const row = await db.getFirstAsync(`SELECT * FROM pet_state WHERE id = 1;`);
  return row || null;
}

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