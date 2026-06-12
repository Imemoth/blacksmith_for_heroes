import type { AffixType, EntityId, ItemType } from "./common.types";

export type BlueprintKind = "base" | "advanced" | "masterwork";

export type BlueprintItemType = ItemType | "any";

export type BlueprintConfig = {
  id: EntityId;
  name: string;
  itemType: BlueprintItemType;
  kind: BlueprintKind;
  goldCost: number;
  requiredRepLevel: number;
  requiredForgeTier: number;
  ownedByDefault?: boolean;
  baseLevelBonus: number;
  allowedAffixes?: AffixType[];
  materialCostMultiplier?: number;
  craftTimeMultiplier?: number;
};

export type BlueprintRuntimeState = {
  ownedBlueprintIds: EntityId[];
};
