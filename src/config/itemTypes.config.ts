import type { ItemType } from "../types/common.types";

export const ITEM_TYPES = {
  sword: {
    itemType: "sword",
    displayName: "Sword",
    baseCost: { ironOre: 4, wood: 1 },
    baseCraftTimeSeconds: 10,
    typeMultiplier: 10,
    primaryMaterial: "ironOre"
  },
  bow: {
    itemType: "bow",
    displayName: "Bow",
    baseCost: { ironOre: 1, wood: 5 },
    baseCraftTimeSeconds: 12,
    typeMultiplier: 9,
    primaryMaterial: "wood"
  },
  staff: {
    itemType: "staff",
    displayName: "Staff",
    baseCost: { ironOre: 1, wood: 6 },
    baseCraftTimeSeconds: 16,
    typeMultiplier: 11,
    primaryMaterial: "wood"
  },
  axe: {
    itemType: "axe",
    displayName: "Axe",
    baseCost: { ironOre: 5, wood: 2 },
    baseCraftTimeSeconds: 14,
    typeMultiplier: 12,
    primaryMaterial: "ironOre"
  }
} as const satisfies Record<
  ItemType,
  {
    itemType: ItemType;
    displayName: string;
    baseCost: { ironOre: number; wood: number };
    baseCraftTimeSeconds: number;
    typeMultiplier: number;
    primaryMaterial: "ironOre" | "wood";
  }
>;
