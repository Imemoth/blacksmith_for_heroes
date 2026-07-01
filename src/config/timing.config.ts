export const TIMING_CONFIG = {
  firstHeroArrivalSeconds: 120,
  heroArrivalSecondsByRepLevel: {
    1: 180,
    2: 180,
    3: 150,
    4: 120,
    5: 90
  },
  heroActiveDurationSeconds: 90,
  heroDismissCooldownSeconds: 300,
  guildOfferedRotationMinSeconds: 300,
  guildOfferedRotationMaxSeconds: 600,
  maxOfflineSeconds: 8 * 60 * 60,
  autosaveIntervalSeconds: 20
} as const;
