import type { AffixType, EntityId, HeroClass, ItemType, Rarity } from "./common.types";

export type UnlockScope = {
  cities?: readonly string[];
  minRepLevel?: number;
  minTier?: number;
  tags?: readonly string[];
};

export type CityContent = {
  id: EntityId;
  name: string;
  theme: string;
  minRepLevel: number;
};

export type WeightedContent = {
  id: EntityId;
  weight: number;
  unlock?: UnlockScope;
};

export type HeroNameContent = WeightedContent & {
  name: string;
  allowedClasses: readonly HeroClass[];
};

export type GuildNameContent = WeightedContent & {
  name: string;
  guildType: string;
  preferredItemTypes: readonly ItemType[];
};

export type GuildContractTemplate = WeightedContent & {
  guildType: string;
  requiredRepLevel: number;
  requiredTier: number;
  requiredOwnedBlueprints: readonly EntityId[];
  itemRequirements: readonly {
    itemType: ItemType;
    quantityMin: number;
    quantityMax: number;
  }[];
  minLevelRange: [number, number];
  goldRewardRange: [number, number];
  reputationRewardRange: [number, number];
};

export type HeroCommissionTemplate = WeightedContent & {
  heroClass: HeroClass;
  requiredRepLevel: number;
  requiredTier: number;
  requiredBlueprintId: EntityId;
  requiredItemType: ItemType;
  minLevelRange: [number, number];
  preferredAffix?: AffixType;
  bonusRarity?: Rarity;
  goldMultiplierRange: [number, number];
  reputationRewardRange: [number, number];
  baseFeedbackChance: number;
};

export type ContentContext = {
  cityId: string;
  reputationLevel: number;
  forgeTier: number;
};
