import { createContext, useEffect, useReducer, useState } from "react";
import { initialPetState, petReducer } from "../reducers/petReducer";
import {
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

      // Apply time-based decay before anything else touches the pet,
      // so stats reflect real elapsed time since the app was last open.
      const decayedStats = applyStatDecay(existingPet);
      existingPet = { ...existingPet, ...decayedStats };
      await updatePetState({
        name: existingPet.name,
        stage: existingPet.stage,
        level: existingPet.level,
        xp: existingPet.xp,
        hunger: existingPet.hunger,
        sleep: existingPet.sleep,
        happiness: existingPet.happiness,
        fishTokens: existingPet.fish_tokens,
      });

      dispatch({ type: "SET_PET", payload: existingPet });

      const claimed = await claimDailyBonusIfEligible(existingPet);
      if (claimed) setDailyBonusClaimed(true);
    })();
  }, []);

  function dismissDailyBonusNotice() {
    setDailyBonusClaimed(false);
  }

  /**
   * Lets the user rename their pet at any time (tap the pet display).
   */
  async function renamePet(newName) {
    if (!state.pet) return;
    const updatedPet = { ...state.pet, name: newName };

    await updatePetState({
      name: updatedPet.name,
      stage: updatedPet.stage,
      level: updatedPet.level,
      xp: updatedPet.xp,
      hunger: updatedPet.hunger,
      sleep: updatedPet.sleep,
      happiness: updatedPet.happiness,
      fishTokens: updatedPet.fish_tokens,
    });

    dispatch({ type: "UPDATE_PET", payload: updatedPet });
  }

  /**
   * Shared internal helper for any "small action" (feed/play/sleep/tickle):
   * applies the stat change, awards the correct XP for the CURRENT level,
   * handles level-ups and stage transitions, then saves + updates state.
   */
  async function applySmallAction(statChanges) {
    if (!state.pet) return;

    const xpGained = calculateSmallActionXp(state.pet.level);
    const { level, xp } = applyXpGain(state.pet.level, state.pet.xp, xpGained);
    const stage = deriveStage(level);

    const updatedPet = {
      ...state.pet,
      ...statChanges,
      level,
      xp,
      stage,
    };

    await updatePetState({
      name: updatedPet.name,
      stage: updatedPet.stage,
      level: updatedPet.level,
      xp: updatedPet.xp,
      hunger: updatedPet.hunger,
      sleep: updatedPet.sleep,
      happiness: updatedPet.happiness,
      fishTokens: updatedPet.fish_tokens,
    });

    dispatch({ type: "UPDATE_PET", payload: updatedPet });
    return updatedPet;
  }

  async function feedPet() {
    if (!state.pet || state.pet.fish_tokens < FEED_COST_FISH) return false;

    await applySmallAction({
      hunger: clampStat(state.pet.hunger + STAT_RESTORE_AMOUNT.FEED_HUNGER),
      fish_tokens: state.pet.fish_tokens - FEED_COST_FISH,
    });
    return true;
  }

  async function playWithPet() {
    if (!state.pet) return;
    await applySmallAction({
      happiness: clampStat(state.pet.happiness + STAT_RESTORE_AMOUNT.PLAY_HAPPINESS),
    });
  }

  async function putPetToSleep() {
    if (!state.pet) return;
    await applySmallAction({
      sleep: clampStat(state.pet.sleep + STAT_RESTORE_AMOUNT.SLEEP_RESTORE),
    });
  }

  async function ticklePet() {
    if (!state.pet) return;
    await applySmallAction({
      happiness: clampStat(state.pet.happiness + STAT_RESTORE_AMOUNT.PLAY_HAPPINESS),
    });
  }

  /**
   * Called externally (from save-cat.js) whenever the user collects a
   * new real cat — awards the bigger XP chunk + a fish token. This keeps
   * PetContext the only place that knows HOW pet stats change, while
   * CatContext stays completely unaware that a pet module exists.
   */
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

    await updatePetState({
      name: updatedPet.name,
      stage: updatedPet.stage,
      level: updatedPet.level,
      xp: updatedPet.xp,
      hunger: updatedPet.hunger,
      sleep: updatedPet.sleep,
      happiness: updatedPet.happiness,
      fishTokens: updatedPet.fish_tokens,
    });

    dispatch({ type: "UPDATE_PET", payload: updatedPet });
  }

  /**
   * Simple daily login bonus: if last_updated was on a different
   * calendar day than today, award fish and refresh the timestamp.
   * Accepts an optional pet override, needed when called from the mount
   * effect where state.pet hasn't been set yet.
   */
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
      await updatePetState({
        name: updatedPet.name,
        stage: updatedPet.stage,
        level: updatedPet.level,
        xp: updatedPet.xp,
        hunger: updatedPet.hunger,
        sleep: updatedPet.sleep,
        happiness: updatedPet.happiness,
        fishTokens: updatedPet.fish_tokens,
      });
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
        ticklePet,
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