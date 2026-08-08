import { createContext, useEffect, useReducer } from "react";
import { initialPetState, petReducer } from "../reducers/petReducer";
import {
  DAILY_FISH_BONUS,
  FEED_COST_FISH,
  FISH_PER_CAT_COLLECTED,
  STAT_RESTORE_AMOUNT,
} from "../services/pet/petConstants";
import {
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

  useEffect(() => {
    (async () => {
      let existingPet = await getPet();
      if (!existingPet) {
        // Every user gets a pet automatically — no adoption gate.
        // Default name is a placeholder; the rename prompt in
        // PersonalCatSlot lets the user personalize it anytime.
        existingPet = await createPet("Your Cat");
      }
      dispatch({ type: "SET_PET", payload: existingPet });
    })();
  }, []);

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
   */
  async function claimDailyBonusIfEligible() {
    if (!state.pet) return;

    const lastUpdatedDate = new Date(state.pet.last_updated).toDateString();
    const todayDate = new Date().toDateString();

    if (lastUpdatedDate !== todayDate) {
      const updatedPet = {
        ...state.pet,
        fish_tokens: state.pet.fish_tokens + DAILY_FISH_BONUS,
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
      }}
    >
      {children}
    </PetContext.Provider>
  );
}