import { RESOURCE_CONFIG } from "../../config/resources.config";
import { TIERS } from "../../config/tiers.config";
import type { SaveGame } from "../../types/save.types";
import type { GameState } from "../../types/gameState.types";
import { clamp } from "../../utils/math";
import { createInitialGameState } from "../state/createInitialGameState";
import { defaultRng } from "../rng/rng";
import { applyOfflineProgress } from "./offlineProgressSystem";
import { initializeOrderState } from "./orderSystem";
import { calculateReputationLevel } from "./reputationSystem";
import { applyOwnedUpgradeEffects } from "./upgradeSystem";

export const SAVE_KEY = "blacksmith_for_heroes_save";
export const CURRENT_SAVE_VERSION = 1;

export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function saveGame(
  state: GameState,
  now: number,
  storage: StorageLike = getDefaultStorage()
): SaveGame {
  const gameState = prepareStateForSave(state, now);
  const save: SaveGame = {
    saveVersion: CURRENT_SAVE_VERSION,
    savedAt: now,
    gameState
  };

  storage.setItem(SAVE_KEY, JSON.stringify(save));
  return save;
}

export function loadGame(
  now: number,
  storage: StorageLike = getDefaultStorage()
): GameState {
  const raw = storage.getItem(SAVE_KEY);

  if (!raw) return createInitialGameState(now);

  try {
    const parsed = JSON.parse(raw) as SaveGame;
    const migrated = migrateSave(parsed);
    return applyOfflineProgress(repairLoadedState(migrated.gameState, now), now);
  } catch {
    return createInitialGameState(now);
  }
}

export function clearSave(storage: StorageLike = getDefaultStorage()): void {
  storage.removeItem(SAVE_KEY);
}

export function migrateSave(save: SaveGame): SaveGame {
  if (save.saveVersion === CURRENT_SAVE_VERSION) return save;

  return {
    ...save,
    saveVersion: CURRENT_SAVE_VERSION
  };
}

export function repairLoadedState(state: GameState, now: number): GameState {
  const initialState = createInitialGameState(now);
  const inventoryItemIds = state.inventory.itemIds.filter((itemId) => Boolean(state.itemsById[itemId]));
  const ownedBlueprintIds = state.blueprints.ownedBlueprintIds.includes("bp_sword_base")
    ? state.blueprints.ownedBlueprintIds
    : ["bp_sword_base", ...state.blueprints.ownedBlueprintIds];
  const forgeSlots = state.workshop.forgeSlots.length
    ? state.workshop.forgeSlots.map((slot) =>
        slot.activeCraftId && !state.workshop.activeCraftsById[slot.activeCraftId]
          ? { ...slot, activeCraftId: undefined }
          : slot
      )
    : initialState.workshop.forgeSlots;
  const tierConfig =
    TIERS[state.workshop.forgeTier as keyof typeof TIERS] ?? TIERS[1];

  const repairedState: GameState = {
    ...state,
    player: {
      ...state.player,
      reputationXp: Math.max(0, state.player.reputationXp),
      reputationLevel: calculateReputationLevel(Math.max(0, state.player.reputationXp))
    },
    resources: {
      ...state.resources,
      gold: Math.max(0, state.resources.gold),
      ironOre: clamp(state.resources.ironOre, 0, state.resources.ironOreCap),
      wood: clamp(state.resources.wood, 0, state.resources.woodCap),
      forgeSigil: Math.max(0, state.resources.forgeSigil),
      ironOreCap: Math.max(RESOURCE_CONFIG.ironOre.startingCap, state.resources.ironOreCap),
      woodCap: Math.max(RESOURCE_CONFIG.wood.startingCap, state.resources.woodCap)
    },
    workshop: {
      ...state.workshop,
      maxItemLevelCap: tierConfig.maxItemLevel,
      forgeSlots
    },
    inventory: {
      ...state.inventory,
      itemIds: inventoryItemIds
    },
    blueprints: {
      ownedBlueprintIds
    },
    upgrades: {
      ownedUpgradeIds: state.upgrades?.ownedUpgradeIds ?? [],
      ownedPrestigeUpgradeIds: state.upgrades?.ownedPrestigeUpgradeIds ?? []
    },
    log: {
      entries: state.log?.entries ?? [],
      maxEntries: state.log?.maxEntries ?? 200
    },
    timers: {
      ...state.timers,
      lastResourceTickAt: Math.min(state.timers.lastResourceTickAt, now)
    },
    lastSavedAt: Math.min(state.lastSavedAt, now)
  };

  return initializeOrderState(applyOwnedUpgradeEffects(repairedState), { now, rng: defaultRng });
}

function prepareStateForSave(state: GameState, now: number): GameState {
  return {
    ...state,
    timers: {
      ...state.timers,
      lastResourceTickAt: now
    },
    lastSavedAt: now
  };
}

function getDefaultStorage(): StorageLike {
  if (typeof localStorage !== "undefined") return localStorage;

  const memory = new Map<string, string>();
  return {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memory.set(key, value);
    },
    removeItem: (key: string) => {
      memory.delete(key);
    }
  };
}
