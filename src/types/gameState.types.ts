import type {
  AffixType,
  EntityId,
  HeroClass,
  ItemType,
  Rarity,
  Seconds,
  TimestampMs
} from "./common.types";
import type { ResourcesState } from "./resources.types";
import type { ItemState } from "./item.types";
import type { BlueprintRuntimeState } from "./blueprint.types";

export type PlayerState = {
  reputationXp: number;
  reputationLevel: number;
  completedGuildContracts: number;
  completedHeroCommissions: number;
  completedOrdersTotal: number;
  craftedItemCount: number;
  craftedRareCount: number;
  craftedEpicCount: number;
  craftedLegendaryCount: number;
  currentRunId: EntityId;
  totalPrestiges: number;
};

export type WorkshopState = {
  forgeTier: number;
  maxItemLevelCap: number;
  forgeSlots: ForgeSlot[];
  activeCraftsById: Record<EntityId, ActiveCraft>;
  craftSpeedMultiplier: number;
  itemLevelMinBonus: number;
  rarityBonusTier: number;
  guildContractSlots: number;
  heroCommissionSlots: number;
  manualGuildRefreshEnabled: boolean;
  manualGuildRefreshCooldownUntil?: TimestampMs;
  inventorySlotBonusFromGold: number;
  inventorySlotBonusFromSigils: number;
};

export type ForgeSlot = {
  slotId: EntityId;
  isUnlocked: boolean;
  activeCraftId?: EntityId;
};

export type ActiveCraft = {
  craftId: EntityId;
  blueprintId: EntityId;
  itemType: ItemType;
  startedAt: TimestampMs;
  completesAt: TimestampMs;
  durationSeconds: Seconds;
  inputMaterials: {
    ironOre: number;
    wood: number;
  };
};

export type InventoryState = {
  itemIds: EntityId[];
  maxSlots: number;
};

export type UpgradeRuntimeState = {
  ownedUpgradeIds: EntityId[];
  ownedPrestigeUpgradeIds: EntityId[];
};

export type OrdersState = {
  guildContractsById: Record<EntityId, GuildContractState>;
  activeGuildContractIds: EntityId[];
  heroCommissionsById: Record<EntityId, HeroCommissionState>;
  activeHeroCommissionIds: EntityId[];
  lastHeroArrivalAt?: TimestampMs;
  nextHeroArrivalAt?: TimestampMs;
  heroDismissCooldownUntil?: TimestampMs;
};

export type GuildContractState = {
  contractId: EntityId;
  templateId: EntityId;
  guildName: string;
  guildType: string;
  requiredItems: GuildRequiredItemState[];
  minLevel: number;
  goldReward: number;
  reputationReward: number;
  status: "offered" | "accepted" | "completed" | "rotated";
  generatedAt: TimestampMs;
  rotateAt?: TimestampMs;
  acceptedAt?: TimestampMs;
  completedAt?: TimestampMs;
};

export type GuildRequiredItemState = {
  itemType: ItemType;
  quantityRequired: number;
  deliveredItemIds: EntityId[];
};

export type HeroCommissionState = {
  commissionId: EntityId;
  templateId: EntityId;
  heroId: EntityId;
  heroName: string;
  heroClass: HeroClass;
  requiredBlueprintId: EntityId;
  requiredItemType: ItemType;
  minLevel: number;
  preferredAffix?: AffixType;
  bonusRarity?: Rarity;
  goldRewardMultiplier: number;
  reputationReward: number;
  baseFeedbackChance: number;
  status: "active" | "waiting_for_blueprint" | "completed" | "dismissed" | "expired";
  isMissingBlueprintCommission: boolean;
  arrivedAt: TimestampMs;
  expiresAt: TimestampMs;
  completedAt?: TimestampMs;
  dismissedAt?: TimestampMs;
};

export type HeroRuntimeState = {
  heroesById: Record<EntityId, HeroState>;
};

export type HeroState = {
  heroId: EntityId;
  name: string;
  heroClass: HeroClass;
  firstSeenAt: TimestampMs;
  lastSeenAt: TimestampMs;
  relationshipXp: number;
  completedCommissionIds: EntityId[];
  equippedItemIds: EntityId[];
  historyEventIds: EntityId[];
};

export type PrestigeState = {
  forgeSigilsEarnedTotal: number;
  forgeSigilsSpentTotal: number;
  masterworkItemIds: EntityId[];
  legendaryItemIds: EntityId[];
  completedPrestigeRuns: PrestigeRunRecord[];
};

export type PrestigeRunRecord = {
  runId: EntityId;
  completedAt: TimestampMs;
  masterworkItemId: EntityId;
  forgeSigilsEarned: number;
  repLevelAtPrestige: number;
  forgeTierAtPrestige: number;
};

export type EventLogState = {
  entries: EventLogEntry[];
  maxEntries: number;
};

export type EventLogEntry = {
  eventId: EntityId;
  type:
    | "craft_started"
    | "craft_completed"
    | "item_sold_market"
    | "guild_contract_accepted"
    | "guild_contract_completed"
    | "guild_contract_rotated"
    | "hero_commission_arrived"
    | "hero_commission_completed"
    | "hero_commission_expired"
    | "hero_commission_dismissed"
    | "hero_feedback"
    | "blueprint_purchased"
    | "upgrade_purchased"
    | "tier_upgraded"
    | "rep_level_up"
    | "legendary_crafted"
    | "inventory_full"
    | "prestige_completed";
  text: string;
  relatedItemId?: EntityId;
  relatedHeroId?: EntityId;
  relatedContractId?: EntityId;
  relatedCommissionId?: EntityId;
  createdAt: TimestampMs;
};

export type TimerState = {
  lastResourceTickAt: TimestampMs;
  lastOfflineProgressAt?: TimestampMs;
};

export type GameState = {
  version: number;
  player: PlayerState;
  resources: ResourcesState;
  workshop: WorkshopState;
  inventory: InventoryState;
  itemsById: Record<EntityId, ItemState>;
  blueprints: BlueprintRuntimeState;
  upgrades: UpgradeRuntimeState;
  orders: OrdersState;
  heroes: HeroRuntimeState;
  prestige: PrestigeState;
  log: EventLogState;
  timers: TimerState;
  currentCityId: string;
  lastSavedAt: TimestampMs;
};
