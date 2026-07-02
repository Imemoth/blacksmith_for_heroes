import type { Rarity } from "../types/common.types";

export const ITEM_QUALITY_CONFIG = {
  randomLevelBonusMax: 3,
  rarityLevelBonus: {
    common: 0,
    fine: 0,
    rare: 1,
    epic: 2,
    legendary: 3
  },
  affixChanceByRarity: {
    common: 0.08,
    fine: 0.35,
    rare: 0.8,
    epic: 1,
    legendary: 1
  }
} as const satisfies {
  randomLevelBonusMax: number;
  rarityLevelBonus: Record<Rarity, number>;
  affixChanceByRarity: Record<Rarity, number>;
};
