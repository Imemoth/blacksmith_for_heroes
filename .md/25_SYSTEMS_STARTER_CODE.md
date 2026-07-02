# Systems Starter Code

## Cél

Ez a dokumentum starter TypeScript skeletonokat ad a core systems implementációhoz.

Nem teljes production code, de jó kiindulópont a Milestone A-hoz.

---

# RNG

```ts
export type Rng = {
  nextFloat(): number;
};

export const defaultRng: Rng = {
  nextFloat: () => Math.random()
};
```

---

# Weighted random

```ts
export function pickWeighted<T extends { weight: number }>(
  items: T[],
  rng: Rng
): T | undefined {
  const total = items.reduce((sum, item) => sum + item.weight, 0);

  if (total <= 0) return undefined;

  let roll = rng.nextFloat() * total;

  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }

  return items[items.length - 1];
}
```

---

# ID helper

```ts
export function createId(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
```

Később érdemes stabilabb ID generátorra cserélni.

---

# Resource System

```ts
import type { GameState } from "../../types/gameState.types";

export function tickResources(state: GameState, now: number): GameState {
  const elapsedMs = Math.max(0, now - state.timers.lastResourceTickAt);
  const elapsedSeconds = elapsedMs / 1000;

  const nextIronOre = Math.min(
    state.resources.ironOreCap,
    state.resources.ironOre + elapsedSeconds * state.resources.ironOreRatePerSecond
  );

  const nextWood = Math.min(
    state.resources.woodCap,
    state.resources.wood + elapsedSeconds * state.resources.woodRatePerSecond
  );

  return {
    ...state,
    resources: {
      ...state.resources,
      ironOre: Math.floor(nextIronOre),
      wood: Math.floor(nextWood)
    },
    timers: {
      ...state.timers,
      lastResourceTickAt: now
    }
  };
}

export function canSpendResources(
  state: GameState,
  cost: { gold?: number; ironOre?: number; wood?: number; forgeSigil?: number }
): boolean {
  return (
    state.resources.gold >= (cost.gold ?? 0) &&
    state.resources.ironOre >= (cost.ironOre ?? 0) &&
    state.resources.wood >= (cost.wood ?? 0) &&
    state.resources.forgeSigil >= (cost.forgeSigil ?? 0)
  );
}

export function spendResources(
  state: GameState,
  cost: { gold?: number; ironOre?: number; wood?: number; forgeSigil?: number }
): GameState {
  if (!canSpendResources(state, cost)) {
    throw new Error("Not enough resources");
  }

  return {
    ...state,
    resources: {
      ...state.resources,
      gold: state.resources.gold - (cost.gold ?? 0),
      ironOre: state.resources.ironOre - (cost.ironOre ?? 0),
      wood: state.resources.wood - (cost.wood ?? 0),
      forgeSigil: state.resources.forgeSigil - (cost.forgeSigil ?? 0)
    }
  };
}
```

---

# Craft System

```ts
import type { GameState } from "../../types/gameState.types";
import type { Rng } from "../rng/rng";
import { BLUEPRINTS } from "../../config/blueprints.config";
import { ITEM_TYPES } from "../../config/itemTypes.config";
import { spendResources, canSpendResources } from "./resourceSystem";
import { createId } from "../../utils/ids";

type SystemContext = {
  now: number;
  rng: Rng;
};

export function canStartCraft(
  state: GameState,
  blueprintId: string
): { ok: boolean; reason?: string } {
  const blueprint = BLUEPRINTS.find(bp => bp.id === blueprintId);

  if (!blueprint) return { ok: false, reason: "Blueprint not found" };

  if (!state.blueprints.ownedBlueprintIds.includes(blueprintId)) {
    return { ok: false, reason: "Blueprint not owned" };
  }

  if (blueprint.itemType === "any") {
    return { ok: false, reason: "Cannot craft generic blueprint directly" };
  }

  if (state.workshop.forgeTier < blueprint.requiredForgeTier) {
    return { ok: false, reason: "Forge tier too low" };
  }

  const freeSlot = state.workshop.forgeSlots.find(
    slot => slot.isUnlocked && !slot.activeCraftId
  );

  if (!freeSlot) return { ok: false, reason: "No free forge slot" };

  const itemType = ITEM_TYPES[blueprint.itemType];

  if (!canSpendResources(state, itemType.baseCost)) {
    return { ok: false, reason: "Not enough materials" };
  }

  if (state.inventory.itemIds.length >= state.inventory.maxSlots) {
    return { ok: false, reason: "Inventory full" };
  }

  return { ok: true };
}

export function startCraft(
  state: GameState,
  blueprintId: string,
  slotId: string,
  context: SystemContext
): GameState {
  const check = canStartCraft(state, blueprintId);
  if (!check.ok) throw new Error(check.reason);

  const blueprint = BLUEPRINTS.find(bp => bp.id === blueprintId)!;
  if (blueprint.itemType === "any") throw new Error("Invalid craft blueprint");

  const itemTypeConfig = ITEM_TYPES[blueprint.itemType];

  const durationSeconds = Math.ceil(
    itemTypeConfig.baseCraftTimeSeconds / state.workshop.craftSpeedMultiplier
  );

  let nextState = spendResources(state, itemTypeConfig.baseCost);

  const craftId = createId("craft");

  const activeCraft = {
    craftId,
    blueprintId,
    itemType: blueprint.itemType,
    startedAt: context.now,
    completesAt: context.now + durationSeconds * 1000,
    durationSeconds,
    inputMaterials: itemTypeConfig.baseCost
  };

  return {
    ...nextState,
    workshop: {
      ...nextState.workshop,
      activeCraftsById: {
        ...nextState.workshop.activeCraftsById,
        [craftId]: activeCraft
      },
      forgeSlots: nextState.workshop.forgeSlots.map(slot =>
        slot.slotId === slotId
          ? { ...slot, activeCraftId: craftId }
          : slot
      )
    }
  };
}
```

---

# Complete Craft

```ts
import { generateItem } from "./itemGenerationSystem";
import { addItemToInventory } from "./inventorySystem";

export function completeCraft(
  state: GameState,
  craftId: string,
  context: SystemContext
): GameState {
  const craft = state.workshop.activeCraftsById[craftId];

  if (!craft) throw new Error("Craft not found");

  if (craft.completesAt > context.now) {
    throw new Error("Craft is not complete yet");
  }

  const item = generateItem(state, craft.blueprintId, context);
  let nextState = addItemToInventory(state, item);

  const { [craftId]: removed, ...remainingCrafts } = nextState.workshop.activeCraftsById;

  const isRare = item.rarity === "rare";
  const isEpic = item.rarity === "epic";
  const isLegendary = item.rarity === "legendary";

  return {
    ...nextState,
    workshop: {
      ...nextState.workshop,
      activeCraftsById: remainingCrafts,
      forgeSlots: nextState.workshop.forgeSlots.map(slot =>
        slot.activeCraftId === craftId
          ? { ...slot, activeCraftId: undefined }
          : slot
      )
    },
    player: {
      ...nextState.player,
      craftedItemCount: nextState.player.craftedItemCount + 1,
      craftedRareCount: nextState.player.craftedRareCount + (isRare ? 1 : 0),
      craftedEpicCount: nextState.player.craftedEpicCount + (isEpic ? 1 : 0),
      craftedLegendaryCount: nextState.player.craftedLegendaryCount + (isLegendary ? 1 : 0)
    },
    prestige: isLegendary
      ? {
          ...nextState.prestige,
          legendaryItemIds: [...nextState.prestige.legendaryItemIds, item.itemId]
        }
      : nextState.prestige
  };
}
```

---

# Item Generation System

```ts
import type { GameState } from "../../types/gameState.types";
import type { ItemState, Rarity } from "../../types/item.types";
import { BLUEPRINTS } from "../../config/blueprints.config";
import { ITEM_TYPES } from "../../config/itemTypes.config";
import { RARITIES } from "../../config/rarities.config";
import { createId } from "../../utils/ids";

export function generateItem(
  state: GameState,
  blueprintId: string,
  context: SystemContext
): ItemState {
  const blueprint = BLUEPRINTS.find(bp => bp.id === blueprintId);
  if (!blueprint) throw new Error("Blueprint not found");
  if (blueprint.itemType === "any") throw new Error("Cannot generate item from generic blueprint");

  const itemTypeConfig = ITEM_TYPES[blueprint.itemType];

  const randomRoll = Math.floor(context.rng.nextFloat() * 4); // 0-3

  const forgeTierBonus = {
    1: 0,
    2: 4,
    3: 8
  }[state.workshop.forgeTier] ?? 0;

  const rawLevel =
    blueprint.baseLevelBonus +
    forgeTierBonus +
    state.workshop.itemLevelMinBonus +
    randomRoll;

  const level = Math.max(
    1,
    Math.min(state.workshop.maxItemLevelCap, rawLevel)
  );

  const rarity = rollRarity(state, context);

  const rarityConfig = RARITIES[rarity];
  const affix = rollAffix(blueprint.itemType, rarity, context);

  const affixBonus = affix?.value ?? 0;

  const power = Math.floor(
    level * itemTypeConfig.typeMultiplier * rarityConfig.powerMultiplier + affixBonus
  );

  const displayName = generateItemName(blueprint.itemType, rarity, affix?.type);

  return {
    itemId: createId("item"),
    itemType: blueprint.itemType,
    blueprintId,
    displayName,
    rarity,
    level,
    power,
    sellValue: power,
    affix,
    state: "inventory",
    createdAt: context.now,
    runId: state.player.currentRunId,
    isLegendary: rarity === "legendary",
    isMasterwork: false
  };
}

export function rollRarity(state: GameState, context: SystemContext): Rarity {
  const entries = Object.values(RARITIES).filter(rarityConfig => {
    if (rarityConfig.rarity === "legendary") {
      return state.workshop.forgeTier >= 3;
    }
    return true;
  });

  const total = entries.reduce((sum, r) => sum + r.baseChance, 0);
  let roll = context.rng.nextFloat() * total;

  for (const entry of entries) {
    roll -= entry.baseChance;
    if (roll <= 0) return entry.rarity;
  }

  return "common";
}

function rollAffix(
  itemType: string,
  rarity: Rarity,
  context: SystemContext
): { type: any; value: number } | undefined {
  if (rarity === "common") return undefined;
  if (rarity === "fine" && context.rng.nextFloat() > 0.25) return undefined;

  if (itemType === "sword") return { type: "sharp", value: 8 };
  if (itemType === "bow") return { type: "precise", value: 0 };
  if (itemType === "staff") return { type: "arcane", value: 0 };
  if (itemType === "axe") return { type: "heavy", value: 0 };

  return { type: "balanced", value: 0 };
}

function generateItemName(
  itemType: string,
  rarity: Rarity,
  affixType?: string
): string {
  const baseName = {
    sword: "Iron Sword",
    bow: "Hunter Bow",
    staff: "Oak Staff",
    axe: "Iron Axe"
  }[itemType] ?? "Weapon";

  if (rarity === "common") return baseName;
  if (rarity === "fine") return `Fine ${baseName}`;
  if (rarity === "rare") return `${capitalize(affixType ?? "Rare")} ${baseName}`;
  if (rarity === "epic") return `Mastercrafted ${baseName}`;
  if (rarity === "legendary") return "Mooncleaver";

  return baseName;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
```

---

# Inventory System

```ts
import type { GameState } from "../../types/gameState.types";
import type { ItemState } from "../../types/item.types";
import { INVENTORY_CONFIG } from "../../config/inventory.config";

export function addItemToInventory(
  state: GameState,
  item: ItemState
): GameState {
  if (state.inventory.itemIds.length >= state.inventory.maxSlots) {
    throw new Error("Inventory full");
  }

  return {
    ...state,
    itemsById: {
      ...state.itemsById,
      [item.itemId]: item
    },
    inventory: {
      ...state.inventory,
      itemIds: [...state.inventory.itemIds, item.itemId]
    }
  };
}

export function sellItemToMarket(
  state: GameState,
  itemId: string
): GameState {
  const item = state.itemsById[itemId];
  if (!item) throw new Error("Item not found");
  if (item.state !== "inventory") throw new Error("Item is not in inventory");

  const goldReward = Math.floor(item.sellValue * INVENTORY_CONFIG.marketSellMultiplier);

  return {
    ...state,
    resources: {
      ...state.resources,
      gold: state.resources.gold + goldReward
    },
    itemsById: {
      ...state.itemsById,
      [itemId]: {
        ...item,
        state: "sold_market"
      }
    },
    inventory: {
      ...state.inventory,
      itemIds: state.inventory.itemIds.filter(id => id !== itemId)
    }
  };
}

export function shouldWarnBeforeGuildDelivery(item: ItemState): boolean {
  return item.rarity === "epic" || item.rarity === "legendary";
}
```

---

# Save System

```ts
const SAVE_KEY = "blacksmith_for_heroes_save";
const CURRENT_SAVE_VERSION = 1;

export function saveGame(state: GameState, now: number): void {
  const save = {
    saveVersion: CURRENT_SAVE_VERSION,
    savedAt: now,
    gameState: {
      ...state,
      lastSavedAt: now
    }
  };

  localStorage.setItem(SAVE_KEY, JSON.stringify(save));
}

export function loadGame(now: number): GameState {
  const raw = localStorage.getItem(SAVE_KEY);

  if (!raw) {
    return createInitialGameState(now);
  }

  const save = JSON.parse(raw);
  const migrated = migrateSave(save);

  return applyOfflineProgress(migrated.gameState, now);
}

function migrateSave(save: any): any {
  if (save.saveVersion === CURRENT_SAVE_VERSION) return save;

  return {
    ...save,
    saveVersion: CURRENT_SAVE_VERSION
  };
}
```

---

# Offline Progress System

```ts
import { TIMING_CONFIG } from "../../config/timing.config";
import { tickResources } from "./resourceSystem";
import { completeCraft } from "./craftSystem";
import { defaultRng } from "../rng/rng";

export function applyOfflineProgress(
  state: GameState,
  now: number
): GameState {
  const elapsedMs = Math.max(0, now - state.lastSavedAt);
  const cappedNow = state.lastSavedAt + Math.min(
    elapsedMs,
    TIMING_CONFIG.maxOfflineSeconds * 1000
  );

  let nextState = tickResources(state, cappedNow);

  const completedCraftIds = Object.values(nextState.workshop.activeCraftsById)
    .filter(craft => craft.completesAt <= cappedNow)
    .map(craft => craft.craftId);

  for (const craftId of completedCraftIds) {
    nextState = completeCraft(nextState, craftId, {
      now: cappedNow,
      rng: defaultRng
    });
  }

  return {
    ...nextState,
    lastSavedAt: now
  };
}
```

---

# Megjegyzés

Ez starter code, nem végleges production code.

Fejlesztéskor javítandó:

- import pathok,
- pontos type-ok,
- event log hozzáadás,
- error handling,
- deterministic RNG,
- tests,
- React/Zustand action wrapperök.
