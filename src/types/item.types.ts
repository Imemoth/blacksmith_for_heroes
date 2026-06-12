import type { AffixType, EntityId, ItemType, Rarity, TimestampMs } from "./common.types";

export type AffixState = {
  type: AffixType;
  value: number;
};

export type ItemState = {
  itemId: EntityId;
  itemType: ItemType;
  blueprintId: EntityId;
  displayName: string;
  rarity: Rarity;
  level: number;
  power: number;
  sellValue: number;
  affix?: AffixState;
  state:
    | "inventory"
    | "assigned_guild"
    | "assigned_hero"
    | "sold_market"
    | "archived_legendary"
    | "archived_masterwork";
  ownerId?: EntityId;
  createdAt: TimestampMs;
  runId: EntityId;
  isLegendary: boolean;
  isMasterwork: boolean;
};
