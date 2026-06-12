export type EntityId = string;
export type TimestampMs = number;
export type Seconds = number;

export type ItemType = "sword" | "bow" | "staff" | "axe";

export type Rarity = "common" | "fine" | "rare" | "epic" | "legendary";

export type AffixType = "sharp" | "balanced" | "precise" | "arcane" | "heavy";

export type HeroClass =
  | "guard"
  | "ranger"
  | "mage"
  | "mercenary"
  | "duelist"
  | "veteran";

export type ResourceCost = {
  gold?: number;
  ironOre?: number;
  wood?: number;
  forgeSigil?: number;
};
