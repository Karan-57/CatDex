// Defines how much total XP is needed to go from one level to the next.
// Formula: level N needs 100 + (N-1)*50 XP (Level 1→2: 100, Level 2→3: 150, etc.)
// This function is the single source of truth for leveling — change the
// formula here only, nothing else needs to know how XP scales.
export function xpRequiredForLevel(level) {
  return 100 + (level - 1) * 50;
}

// Small actions (feed, tickle, play, put to sleep) each give 10% of that
// level's total XP requirement. Collecting a new cat gives 50%.
export const XP_ACTION_PERCENT = {
  SMALL_ACTION: 0.1, // feed, tickle, play, sleep
  COLLECT_CAT: 0.5,
};

// Stage transitions based on level (tune these later once gameplay is tested).
export const STAGE_THRESHOLDS = {
  kitten: { minLevel: 1, maxLevel: 4 },
  teen: { minLevel: 5, maxLevel: 9 },
  adult: { minLevel: 10, maxLevel: Infinity },
};

// Daily fish token bonus for opening the app.
export const DAILY_FISH_BONUS = 3;

// Fish earned per real cat collected.
export const FISH_PER_CAT_COLLECTED = 1;

// Fish cost to feed the pet once.
export const FEED_COST_FISH = 1;

// How much each stat action restores (0-100 scale).
export const STAT_RESTORE_AMOUNT = {
  FEED_HUNGER: 30,
  PLAY_HAPPINESS: 20,
  SLEEP_RESTORE: 40,
};

// All three stats drain fully (100 -> 0) over this many hours if the
// app is never opened. Applied as elapsed-time decay on app launch,
// not a running timer, since the app isn't running in the background.
export const HOURS_TO_FULL_DECAY = 24;
export const DECAY_PER_HOUR = 100 / HOURS_TO_FULL_DECAY;

export const ACTION_DURATIONS_MS = {
  feeding: 8 * 1000,
  playing: 15 * 60 * 1000,
  sleeping: 60 * 60 * 1000,
};