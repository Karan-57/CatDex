import { DECAY_PER_HOUR, STAGE_THRESHOLDS, XP_ACTION_PERCENT, xpRequiredForLevel } from "./petConstants";

/**
 * Adds XP for a "small action" (feed/tickle/play/sleep) — always 10% of
 * the CURRENT level's total requirement, regardless of current XP progress.
 */
export function calculateSmallActionXp(currentLevel) {
  return Math.round(xpRequiredForLevel(currentLevel) * XP_ACTION_PERCENT.SMALL_ACTION);
}

/**
 * XP awarded for collecting a real cat — 50% of current level's requirement.
 */
export function calculateCollectCatXp(currentLevel) {
  return Math.round(xpRequiredForLevel(currentLevel) * XP_ACTION_PERCENT.COLLECT_CAT);
}

/**
 * Given current level + xp, and an amount of XP just earned, returns the
 * new { level, xp } — handles multi-level-ups in a single action (e.g.
 * if collecting a cat's XP happens to push past 2 level thresholds).
 */
export function applyXpGain(currentLevel, currentXp, xpGained) {
  let level = currentLevel;
  let xp = currentXp + xpGained;

  while (xp >= xpRequiredForLevel(level)) {
    xp -= xpRequiredForLevel(level);
    level += 1;
  }

  return { level, xp };
}

/**
 * Determines the pet's life stage (kitten/teen/adult) purely from level.
 * Isolated here so changing stage thresholds never touches UI code.
 */
export function deriveStage(level) {
  for (const [stageName, range] of Object.entries(STAGE_THRESHOLDS)) {
    if (level >= range.minLevel && level <= range.maxLevel) {
      return stageName;
    }
  }
  return "adult"; // fallback safety net
}

/**
 * Looks at all 3 stats and returns ONE emotion string for display.
 * Priority order matters: critical needs (sleep/hunger very low) should
 * always show over a merely "happy" state, since they need the user's
 * attention more urgently.
 */
export function deriveEmotion(petState) {
  const { hunger, sleep, happiness } = petState;

  if (sleep <= 20) return "sleepy";
  if (hunger <= 20) return "hungry";
  if (happiness <= 20) return "sad";
  if (happiness >= 80 && hunger >= 80 && sleep >= 80) return "happy";
  return "content";
}

/**
 * Clamps any stat value to the valid 0-100 range. Used after every
 * stat-changing action so bars never overflow or go negative.
 */
export function clampStat(value) {
  return Math.max(0, Math.min(100, value));
}

/**
 * Calculates how much each stat should have dropped since last_updated,
 * based on real elapsed time, and returns the new clamped stat values.
 * Pure function: takes the pet's current stats + timestamp, returns new
 * stats — no DB or React involved, so it's easy to test independently.
 */
export function applyStatDecay(pet) {
  const now = new Date();
  const lastUpdated = new Date(pet.last_updated);
  const hoursElapsed = (now - lastUpdated) / (1000 * 60 * 60);

  if (hoursElapsed <= 0) {
    return { hunger: pet.hunger, sleep: pet.sleep, happiness: pet.happiness };
  }

  const decayAmount = hoursElapsed * DECAY_PER_HOUR;

  return {
    hunger: clampStat(pet.hunger - decayAmount),
    sleep: clampStat(pet.sleep - decayAmount),
    happiness: clampStat(pet.happiness - decayAmount),
  };
}