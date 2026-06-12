export const TIMING_CONFIG = {
  heroArrivalSecondsByRepLevel: {
    1: 300,
    2: 300,
    3: 240,
    4: 180,
    5: 120
  },
  heroActiveDurationSeconds: 90,
  heroDismissCooldownSeconds: 300,
  guildOfferedRotationMinSeconds: 300,
  guildOfferedRotationMaxSeconds: 600,
  maxOfflineSeconds: 8 * 60 * 60,
  autosaveIntervalSeconds: 20
} as const;
