import { createContext, useEffect, useReducer, useState } from "react";
import { initialPetState, petReducer } from "../reducers/petReducer";
import {
  ACTION_DURATIONS_MS,
  DAILY_FISH_BONUS,
  FEED_COST_FISH,
  FISH_PER_CAT_COLLECTED,
  STAT_RESTORE_AMOUNT,
} from "../services/pet/petConstants";
import {
  applyStatDecay,
  applyXpGain,
  calculateCollectCatXp,
  calculateSmallActionXp,
  clampStat,
  deriveStage,
  isActionOnCooldown,
} from "../services/pet/petLogic";
import { createPet, getPet, updatePetState } from "../services/pet/petQueries";

export const PetContext = createContext(null);

export function PetProvider({ children }) {
  const [state, dispatch] = useReducer(petReducer, initialPetState);
  const [dailyBonusClaimed, setDailyBonusClaimed] = useState(false);

  useEffect(() => {
    (async () => {
      let existingPet = await getPet();
      if (!existingPet) {
        existingPet = await createPet("Your Cat");
      }

      const decayedStats = applyStatDecay(existingPet);
      existingPet = { ...existingPet, ...decayedStats };
      await persist(existingPet);

      dispatch({ type: "SET_PET", payload: existingPet });

      const claimed = await claimDailyBonusIfEligible(existingPet);
      if (claimed) setDailyBonusClaimed(true);
    })();
  }, []);

  function dismissDailyBonusNotice() {
    setDailyBonusClaimed(false);
  }

  // Single shared save helper - every function below builds a full
  // "updatedPet" object then calls this to persist + sync state,
  // so field names/shape stay consistent everywhere.
async function persist(updatedPet) {
  await updatePetState({
    name: updatedPet.name,
    stage: updatedPet.stage,
    level: updatedPet.level,
    xp: updatedPet.xp,
    hunger: updatedPet.hunger,
    sleep: updatedPet.sleep,
    happiness: updatedPet.happiness,
    fishTokens: updatedPet.fish_tokens,
    currentAction: updatedPet.current_action,
    actionEndTime: updatedPet.action_end_time,
    feedCooldownEnd: updatedPet.feed_cooldown_end,
    playCooldownEnd: updatedPet.play_cooldown_end,
    sleepCooldownEnd: updatedPet.sleep_cooldown_end,
  });
}

  async function renamePet(newName) {
    if (!state.pet) return;
    const updatedPet = { ...state.pet, name: newName };
    await persist(updatedPet);
    dispatch({ type: "UPDATE_PET", payload: updatedPet });
  }

  /**
   * Starts a temporary action pose (feeding/playing/sleeping) that
   * reverts to the normal derived emotion once action_end_time passes.
   * Stored in DB so it survives app close/reopen.
   */
async function startAction(actionName, statChanges) {
  if (!state.pet) return;

  const xpGained = calculateSmallActionXp(state.pet.level);
  const { level, xp } = applyXpGain(state.pet.level, state.pet.xp, xpGained);
  const stage = deriveStage(level);
  const endTime = new Date(Date.now() + ACTION_DURATIONS_MS[actionName]).toISOString();
  const cooldownEndTime = new Date(Date.now() + ACTION_COOLDOWN_MS).toISOString();

  const cooldownFieldMap = {
    feeding: "feed_cooldown_end",
    playing: "play_cooldown_end",
    sleeping: "sleep_cooldown_end",
  };

  const updatedPet = {
    ...state.pet,
    ...statChanges,
    level,
    xp,
    stage,
    current_action: actionName,
    action_end_time: endTime,
    [cooldownFieldMap[actionName]]: cooldownEndTime,
  };

  await persist(updatedPet);
  dispatch({ type: "UPDATE_PET", payload: updatedPet });
  return updatedPet;
}

async function feedPet() {
  if (!state.pet || state.pet.fish_tokens < FEED_COST_FISH) return false;
  if (isActionOnCooldown(state.pet, "feeding")) return false;
  await startAction("feeding", {
    hunger: clampStat(state.pet.hunger + STAT_RESTORE_AMOUNT.FEED_HUNGER),
    fish_tokens: state.pet.fish_tokens - FEED_COST_FISH,
  });
  return true;
}

async function playWithPet() {
  if (!state.pet) return false;
  if (isActionOnCooldown(state.pet, "playing")) return false;
  await startAction("playing", {
    happiness: clampStat(state.pet.happiness + STAT_RESTORE_AMOUNT.PLAY_HAPPINESS),
  });
  return true;
}

async function putPetToSleep() {
  if (!state.pet) return false;
  if (isActionOnCooldown(state.pet, "sleeping")) return false;
  await startAction("sleeping", {
    sleep: clampStat(state.pet.sleep + STAT_RESTORE_AMOUNT.SLEEP_RESTORE),
  });
  return true;
}

  async function playWithPet() {
    if (!state.pet) return;
    await startAction("playing", {
      happiness: clampStat(state.pet.happiness + STAT_RESTORE_AMOUNT.PLAY_HAPPINESS),
    });
  }

  async function putPetToSleep() {
    if (!state.pet) return;
    await startAction("sleeping", {
      sleep: clampStat(state.pet.sleep + STAT_RESTORE_AMOUNT.SLEEP_RESTORE),
    });
  }

  async function collectCatBonus() {
    if (!state.pet) return;

    const xpGained = calculateCollectCatXp(state.pet.level);
    const { level, xp } = applyXpGain(state.pet.level, state.pet.xp, xpGained);
    const stage = deriveStage(level);

    const updatedPet = {
      ...state.pet,
      level,
      xp,
      stage,
      fish_tokens: state.pet.fish_tokens + FISH_PER_CAT_COLLECTED,
    };

    await persist(updatedPet);
    dispatch({ type: "UPDATE_PET", payload: updatedPet });
  }

  async function claimDailyBonusIfEligible(petOverride) {
    const currentPet = petOverride || state.pet;
    if (!currentPet) return false;

    const lastUpdatedDate = new Date(currentPet.last_updated).toDateString();
    const todayDate = new Date().toDateString();

    if (lastUpdatedDate !== todayDate) {
      const updatedPet = {
        ...currentPet,
        fish_tokens: currentPet.fish_tokens + DAILY_FISH_BONUS,
      };
      await persist(updatedPet);
      dispatch({ type: "UPDATE_PET", payload: updatedPet });
      return true;
    }
    return false;
  }

  return (
    <PetContext.Provider
      value={{
        ...state,
        renamePet,
        feedPet,
        playWithPet,
        putPetToSleep,
        collectCatBonus,
        claimDailyBonusIfEligible,
        dailyBonusClaimed,
        dismissDailyBonusNotice,
      }}
    >
      {children}
    </PetContext.Provider>
  );
}