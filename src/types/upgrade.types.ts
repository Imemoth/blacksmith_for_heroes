import type { EntityId } from "./common.types";

export type UpgradeCategory =
  | "forge_speed"
  | "material_income"
  | "storage"
  | "order_slots"
  | "order_refresh"
  | "item_level"
  | "rarity"
  | "tier"
  | "prestige";

export type UpgradeConfig = {
  id: EntityId;
  name: string;
  description: string;
  category: UpgradeCategory;
  goldCost?: number;
  forgeSigilCost?: number;
  requirements?: {
    upgradeOwned?: EntityId;
    completedOrdersTotal?: number;
    craftedEpicCount?: number;
    minTier?: number;
    minPrestigeCount?: number;
  };
  effect: {
    craftSpeedMultiplierAdd?: number;
    ironOreRateMultiplierAdd?: number;
    woodRateMultiplierAdd?: number;
    materialCapMultiplierAdd?: number;
    inventorySlotAdd?: number;
    permanentInventorySlotAdd?: number;
    permanentStartingIronOreAdd?: number;
    permanentStartingWoodAdd?: number;
    itemLevelMinBonusAdd?: number;
    rarityBonusTier?: number;
    guildContractSlotAdd?: number;
    heroCommissionSlotAdd?: number;
    manualGuildRefreshEnabled?: boolean;
    manualGuildRefreshCooldownSeconds?: number;
    forgeTierSet?: number;
  };
};
