import { AFFIXES } from "../../config/affixes.config";
import { BLUEPRINTS } from "../../config/blueprints.config";
import { ITEM_QUALITY_CONFIG } from "../../config/itemQuality.config";
import { ITEM_TYPES } from "../../config/itemTypes.config";
import { POLISHING_KIT_I_RARITIES, RARITIES } from "../../config/rarities.config";
import { LEGENDARY_NAMES } from "../../content/legendaryNames.config";
import type { AffixType, EntityId, ItemType, Rarity } from "../../types/common.types";
import type { ItemState } from "../../types/item.types";
import type { GameState } from "../../types/gameState.types";
import { createId } from "../../utils/ids";
import { clamp } from "../../utils/math";
import type { SystemContext } from "../rng/rng";
import { getEffectiveBlueprintLevelBonus } from "./blueprintSystem";

export type CraftableLevelRange = readonly [number, number];

export function generateItem(
  state: GameState,
  blueprintId: string,
  context: SystemContext
): ItemState {
  const blueprint = BLUEPRINTS.find((candidate) => candidate.id === blueprintId);

  if (!blueprint) throw new Error("Blueprint not found");
  if (blueprint.itemType === "any") {
    throw new Error("Cannot generate item from generic blueprint");
  }

  const itemTypeConfig = ITEM_TYPES[blueprint.itemType];
  const randomRoll = Math.floor(
    context.rng.nextFloat() * (ITEM_QUALITY_CONFIG.randomLevelBonusMax + 1)
  );
  const rarity = rollRarity(state, context);
  const forgeTierBonus = getForgeTierLevelBonus(state.workshop.forgeTier);
  const rawLevel =
    getEffectiveBlueprintLevelBonus(blueprint) +
    forgeTierBonus +
    state.workshop.itemLevelMinBonus +
    randomRoll +
    ITEM_QUALITY_CONFIG.rarityLevelBonus[rarity];
  const level = Math.floor(clamp(rawLevel, 1, state.workshop.maxItemLevelCap));
  const rarityConfig = RARITIES[rarity];
  const affix = rollAffix(blueprint.itemType, rarity, context, blueprint.allowedAffixes);
  const affixPowerBonus = getAffixPowerBonus(affix?.type);
  const power = Math.floor(
    level * itemTypeConfig.typeMultiplier * rarityConfig.powerMultiplier + affixPowerBonus
  );

  return {
    itemId: createId("item"),
    itemType: blueprint.itemType,
    blueprintId,
    displayName: generateItemName(blueprint.itemType, rarity, affix?.type, context),
    rarity,
    level,
    power,
    sellValue: Math.floor(power),
    affix,
    state: "inventory",
    createdAt: context.now,
    runId: state.player.currentRunId,
    isLegendary: rarity === "legendary",
    isMasterwork: false
  };
}

export function getCraftableLevelRangeForBlueprint(
  state: GameState,
  blueprintId: EntityId
): CraftableLevelRange | undefined {
  const blueprint = BLUEPRINTS.find((candidate) => candidate.id === blueprintId);

  if (!blueprint) return undefined;
  if (blueprint.itemType === "any") return undefined;
  if (state.workshop.forgeTier < blueprint.requiredForgeTier) return undefined;

  const baseLevel =
    getEffectiveBlueprintLevelBonus(blueprint) +
    getForgeTierLevelBonus(state.workshop.forgeTier) +
    state.workshop.itemLevelMinBonus;
  const minLevel = Math.floor(clamp(baseLevel, 1, state.workshop.maxItemLevelCap));
  const maxLevel = Math.floor(clamp(baseLevel + 3, 1, state.workshop.maxItemLevelCap));

  return [minLevel, maxLevel];
}

export function getCraftableLevelRangeForItemType(
  state: GameState,
  itemType: ItemType
): CraftableLevelRange | undefined {
  const ownedRanges = BLUEPRINTS.filter(
    (blueprint) =>
      blueprint.itemType === itemType && state.blueprints.ownedBlueprintIds.includes(blueprint.id)
  )
    .map((blueprint) => getCraftableLevelRangeForBlueprint(state, blueprint.id))
    .filter((range) => range !== undefined);

  if (!ownedRanges.length) return undefined;

  return [
    Math.min(...ownedRanges.map(([minLevel]) => minLevel)),
    Math.max(...ownedRanges.map(([, maxLevel]) => maxLevel))
  ];
}

export function rollRarity(state: GameState, context: SystemContext): Rarity {
  const chanceTable = state.workshop.rarityBonusTier > 0 ? POLISHING_KIT_I_RARITIES : undefined;
  const rarityEntries = Object.values(RARITIES).filter((rarityConfig) => {
    if (rarityConfig.rarity !== "legendary") return true;
    return state.workshop.forgeTier >= (rarityConfig.minTier ?? 3);
  }).map((rarityConfig) => ({
    rarity: rarityConfig.rarity,
    chance: chanceTable?.[rarityConfig.rarity] ?? rarityConfig.baseChance
  }));
  const total = rarityEntries.reduce((sum, entry) => sum + entry.chance, 0);
  let roll = context.rng.nextFloat() * total;

  for (const entry of rarityEntries) {
    roll -= entry.chance;
    if (roll <= 0) return entry.rarity;
  }

  return "common";
}

export function generateItemName(
  itemType: ItemType,
  rarity: Rarity,
  affixType: AffixType | undefined,
  context?: SystemContext
): string {
  const baseName: Record<ItemType, string> = {
    sword: "Iron Sword",
    bow: "Hunter Bow",
    staff: "Oak Staff",
    axe: "Iron Axe"
  };

  if (rarity === "common") return baseName[itemType];
  if (rarity === "fine") return `Fine ${baseName[itemType]}`;
  if (rarity === "rare") return `${capitalize(affixType ?? "Rare")} ${baseName[itemType]}`;
  if (rarity === "epic") return `Mastercrafted ${baseName[itemType]}`;

  const index = context
    ? Math.floor(context.rng.nextFloat() * LEGENDARY_NAMES.length)
    : 0;
  return LEGENDARY_NAMES[index] ?? LEGENDARY_NAMES[0];
}

function rollAffix(
  itemType: ItemType,
  rarity: Rarity,
  context: SystemContext,
  allowedAffixes?: readonly AffixType[]
): { type: AffixType; value: number } | undefined {
  const affixChance = ITEM_QUALITY_CONFIG.affixChanceByRarity[rarity];

  if (affixChance <= 0) return undefined;
  if (affixChance < 1 && context.rng.nextFloat() >= affixChance) return undefined;

  const validAffixes = Object.values(AFFIXES).filter(
    (affixConfig) =>
      (affixConfig.validItemTypes as readonly ItemType[]).includes(itemType) &&
      (!allowedAffixes || allowedAffixes.includes(affixConfig.type))
  );
  const selected = validAffixes[Math.floor(context.rng.nextFloat() * validAffixes.length)];

  if (!selected) return undefined;

  return {
    type: selected.type,
    value: selected.effectType === "flat_power_bonus" ? selected.baseValue : 0
  };
}

function getAffixPowerBonus(affixType: AffixType | undefined): number {
  if (!affixType) return 0;
  const affix = AFFIXES[affixType];
  return affix.effectType === "flat_power_bonus" ? affix.baseValue : 0;
}

function getForgeTierLevelBonus(forgeTier: number): number {
  if (forgeTier >= 3) return 8;
  if (forgeTier >= 2) return 4;
  return 0;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
