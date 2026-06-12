export const TIERS = {
  1: {
    tier: 1,
    name: "Basic Forge",
    maxItemLevel: 8,
    legendaryEnabled: false
  },
  2: {
    tier: 2,
    name: "Reinforced Forge",
    maxItemLevel: 15,
    legendaryEnabled: false,
    goldCost: 700,
    requirements: {
      completedOrdersTotal: 10,
      upgradeOwned: "better_anvil_i"
    }
  },
  3: {
    tier: 3,
    name: "Master Forge",
    maxItemLevel: 20,
    legendaryEnabled: true,
    legendaryBaseChance: 0.0005,
    goldCost: 1800,
    requirements: {
      completedOrdersTotal: 25,
      craftedEpicCount: 1,
      requiredCurrentTier: 2
    }
  }
} as const;
