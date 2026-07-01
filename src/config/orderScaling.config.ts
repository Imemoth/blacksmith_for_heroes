export const ORDER_LEVEL_BANDS = {
  rep1Tier1: { min: 1, max: 3 },
  rep2Tier1: { min: 2, max: 5 },
  rep3Tier1Or2: { min: 4, max: 8 },
  rep4Tier2: { min: 7, max: 12 },
  rep5Tier2Or3: { min: 10, max: 16 },
  tier3Advanced: { min: 14, max: 20 }
} as const;
