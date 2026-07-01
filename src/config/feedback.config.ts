import type { Rarity } from "../types/common.types";
import type { FeedbackRewardState } from "../types/gameState.types";

export const FEEDBACK_CONFIG = {
  capChance: 0.9,
  rarityBonus: {
    common: 0,
    fine: 0.05,
    rare: 0.12,
    epic: 0.25,
    legendary: 0.4
  } satisfies Record<Rarity, number>,
  preferredAffixBonus: 0.15,
  overdeliveryBonusPerLevel: 0.02,
  overdeliveryMaxBonus: 0.15,
  rewardByRarity: {
    common: { type: "none", amount: 0 },
    fine: { type: "reputation", amount: 3 },
    rare: { type: "reputation", amount: 6 },
    epic: { type: "reputation", amount: 12 },
    legendary: { type: "reputation", amount: 25 }
  } satisfies Record<Rarity, FeedbackRewardState>
} as const;
