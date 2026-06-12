import type { GuildContractTemplate } from "../types/order.types";

export const GUILD_CONTRACT_TEMPLATES = [
  {
    id: "contract_town_guard_swords_small",
    guildType: "guard",
    requiredRepLevel: 1,
    requiredTier: 1,
    requiredOwnedBlueprints: ["bp_sword_base"],
    itemRequirements: [{ itemType: "sword", quantityMin: 2, quantityMax: 3 }],
    minLevelRange: [1, 3],
    goldRewardRange: [80, 140],
    reputationRewardRange: [4, 8],
    weight: 12,
    unlock: { cities: ["oakvale"] }
  },
  {
    id: "contract_village_militia_swords",
    guildType: "guard",
    requiredRepLevel: 1,
    requiredTier: 1,
    requiredOwnedBlueprints: ["bp_sword_base"],
    itemRequirements: [{ itemType: "sword", quantityMin: 3, quantityMax: 4 }],
    minLevelRange: [1, 4],
    goldRewardRange: [120, 210],
    reputationRewardRange: [5, 9],
    weight: 10,
    unlock: { cities: ["oakvale"] }
  },
  {
    id: "contract_hunters_bows",
    guildType: "hunter",
    requiredRepLevel: 2,
    requiredTier: 1,
    requiredOwnedBlueprints: ["bp_bow_base"],
    itemRequirements: [{ itemType: "bow", quantityMin: 3, quantityMax: 5 }],
    minLevelRange: [3, 6],
    goldRewardRange: [180, 300],
    reputationRewardRange: [8, 12],
    weight: 10,
    unlock: { cities: ["oakvale"] }
  },
  {
    id: "contract_mage_circle_staffs",
    guildType: "mage",
    requiredRepLevel: 3,
    requiredTier: 1,
    requiredOwnedBlueprints: ["bp_staff_base"],
    itemRequirements: [{ itemType: "staff", quantityMin: 2, quantityMax: 4 }],
    minLevelRange: [6, 9],
    goldRewardRange: [260, 420],
    reputationRewardRange: [10, 18],
    weight: 8,
    unlock: { cities: ["oakvale"] }
  },
  {
    id: "contract_mercenary_axes",
    guildType: "mercenary",
    requiredRepLevel: 4,
    requiredTier: 1,
    requiredOwnedBlueprints: ["bp_axe_base"],
    itemRequirements: [{ itemType: "axe", quantityMin: 4, quantityMax: 7 }],
    minLevelRange: [8, 12],
    goldRewardRange: [450, 750],
    reputationRewardRange: [16, 28],
    weight: 8,
    unlock: { cities: ["oakvale"] }
  }
] as const satisfies GuildContractTemplate[];
