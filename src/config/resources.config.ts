export const RESOURCE_CONFIG = {
  gold: {
    id: "gold",
    displayName: "Gold",
    startingAmount: 0
  },
  ironOre: {
    id: "ironOre",
    displayName: "Iron Ore",
    startingAmount: 12,
    startingCap: 30,
    baseRatePerSecond: 1 / 8
  },
  wood: {
    id: "wood",
    displayName: "Wood",
    startingAmount: 6,
    startingCap: 25,
    baseRatePerSecond: 1 / 10
  },
  forgeSigil: {
    id: "forgeSigil",
    displayName: "Forge Sigil",
    startingAmount: 0
  }
} as const;
