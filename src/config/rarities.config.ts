import type { Rarity } from "../types/common.types";

export const RARITIES = {
  common: {
    rarity: "common",
    displayName: "Common",
    baseChance: 0.815,
    powerMultiplier: 1,
    uniqueName: false
  },
  fine: {
    rarity: "fine",
    displayName: "Fine",
    baseChance: 0.15,
    powerMultiplier: 1.08,
    uniqueName: false
  },
  rare: {
    rarity: "rare",
    displayName: "Rare",
    baseChance: 0.03,
    powerMultiplier: 1.22,
    uniqueName: false
  },
  epic: {
    rarity: "epic",
    displayName: "Epic",
    baseChance: 0.0045,
    powerMultiplier: 1.5,
    uniqueName: false
  },
  legendary: {
    rarity: "legendary",
    displayName: "Legendary",
    baseChance: 0.0005,
    powerMultiplier: 2.2,
    minTier: 3,
    uniqueName: true
  }
} as const satisfies Record<
  Rarity,
  {
    rarity: Rarity;
    displayName: string;
    baseChance: number;
    powerMultiplier: number;
    minTier?: number;
    uniqueName: boolean;
  }
>;

export const POLISHING_KIT_I_RARITIES = {
  common: 0.788,
  fine: 0.165,
  rare: 0.04,
  epic: 0.0062,
  legendary: 0.0008
} as const;
