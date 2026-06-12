import type { AffixType, ItemType } from "../types/common.types";

export const AFFIXES = {
  sharp: {
    type: "sharp",
    displayName: "Sharp",
    validItemTypes: ["sword", "axe"],
    effectType: "flat_power_bonus",
    baseValue: 8
  },
  balanced: {
    type: "balanced",
    displayName: "Balanced",
    validItemTypes: ["sword", "bow", "staff", "axe"],
    effectType: "order_value_bonus",
    baseValue: 0.08
  },
  precise: {
    type: "precise",
    displayName: "Precise",
    validItemTypes: ["bow", "sword"],
    effectType: "ranger_match_bonus",
    baseValue: 0.15
  },
  arcane: {
    type: "arcane",
    displayName: "Arcane",
    validItemTypes: ["staff"],
    effectType: "mage_match_bonus",
    baseValue: 0.15
  },
  heavy: {
    type: "heavy",
    displayName: "Heavy",
    validItemTypes: ["axe"],
    effectType: "warrior_match_bonus",
    baseValue: 0.15
  }
} as const satisfies Record<
  AffixType,
  {
    type: AffixType;
    displayName: string;
    validItemTypes: ItemType[];
    effectType:
      | "flat_power_bonus"
      | "order_value_bonus"
      | "ranger_match_bonus"
      | "mage_match_bonus"
      | "warrior_match_bonus";
    baseValue: number;
  }
>;
