# Content Starter Pack

## Cél

Ez a fájl induló content poolokat ad az MVP-hez.

A tartalom adatvezérelt legyen:

- városhoz köthető,
- Reputationhöz köthető,
- Tierhez köthető,
- classhoz / item type-hoz köthető,
- weighted random alapján választható.

MVP kezdő város:

```txt
Oakvale
```

---

# City content

```ts
export const cities = [
  {
    id: "oakvale",
    name: "Oakvale",
    theme: "starter_forest_town",
    minRepLevel: 1
  }
];
```

## Oakvale fantasy

Kis erdei kereskedőváros, ahol a kovács először városi őröknek, vadászoknak, mágus tanoncoknak és zsoldosoknak dolgozik.

---

# Hero name pool

```ts
export const heroNamePool = [
  { id: "hero_borin", name: "Borin", allowedClasses: ["guard", "mercenary"], weight: 12, unlock: { cities: ["oakvale"], minRepLevel: 1 } },
  { id: "hero_tessa", name: "Tessa", allowedClasses: ["guard", "duelist"], weight: 10, unlock: { cities: ["oakvale"], minRepLevel: 1 } },
  { id: "hero_garrik", name: "Garrik", allowedClasses: ["guard", "mercenary"], weight: 10, unlock: { cities: ["oakvale"], minRepLevel: 1 } },

  { id: "hero_arin", name: "Arin", allowedClasses: ["ranger"], weight: 10, unlock: { cities: ["oakvale"], minRepLevel: 2 } },
  { id: "hero_lyra", name: "Lyra", allowedClasses: ["ranger", "duelist"], weight: 9, unlock: { cities: ["oakvale"], minRepLevel: 2 } },
  { id: "hero_fenn", name: "Fenn", allowedClasses: ["ranger"], weight: 8, unlock: { cities: ["oakvale"], minRepLevel: 2 } },

  { id: "hero_mira", name: "Mira", allowedClasses: ["mage"], weight: 8, unlock: { cities: ["oakvale"], minRepLevel: 3 } },
  { id: "hero_elowen", name: "Elowen", allowedClasses: ["mage"], weight: 7, unlock: { cities: ["oakvale"], minRepLevel: 3 } },
  { id: "hero_kael", name: "Kael", allowedClasses: ["mage", "veteran"], weight: 6, unlock: { cities: ["oakvale"], minRepLevel: 3 } },

  { id: "hero_brakka", name: "Brakka", allowedClasses: ["mercenary"], weight: 8, unlock: { cities: ["oakvale"], minRepLevel: 4 } },
  { id: "hero_roven", name: "Roven", allowedClasses: ["mercenary", "duelist"], weight: 7, unlock: { cities: ["oakvale"], minRepLevel: 4 } },
  { id: "hero_maelis", name: "Maelis", allowedClasses: ["duelist"], weight: 6, unlock: { cities: ["oakvale"], minRepLevel: 4 } },

  { id: "hero_selene", name: "Selene", allowedClasses: ["duelist", "veteran"], weight: 4, unlock: { cities: ["oakvale"], minRepLevel: 5, minTier: 2 } },
  { id: "hero_orren", name: "Orren", allowedClasses: ["veteran"], weight: 4, unlock: { cities: ["oakvale"], minRepLevel: 5, minTier: 2 } },
  { id: "hero_varek", name: "Varek", allowedClasses: ["veteran", "mercenary"], weight: 3, unlock: { cities: ["oakvale"], minRepLevel: 5, minTier: 2 } }
];
```

---

# Guild name pool

```ts
export const guildNamePool = [
  { id: "guild_town_guard", name: "Town Guard", guildType: "guard", preferredItemTypes: ["sword"], weight: 12, unlock: { cities: ["oakvale"], minRepLevel: 1 } },
  { id: "guild_village_militia", name: "Village Militia", guildType: "guard", preferredItemTypes: ["sword", "axe"], weight: 10, unlock: { cities: ["oakvale"], minRepLevel: 1 } },

  { id: "guild_hunters", name: "Hunters' Guild", guildType: "hunter", preferredItemTypes: ["bow"], weight: 10, unlock: { cities: ["oakvale"], minRepLevel: 2 } },
  { id: "guild_greenwatch", name: "Greenwatch Scouts", guildType: "hunter", preferredItemTypes: ["bow", "sword"], weight: 8, unlock: { cities: ["oakvale"], minRepLevel: 2 } },

  { id: "guild_mage_circle", name: "Mage Circle", guildType: "mage", preferredItemTypes: ["staff"], weight: 8, unlock: { cities: ["oakvale"], minRepLevel: 3 } },
  { id: "guild_apprentice_lodge", name: "Apprentice Lodge", guildType: "mage", preferredItemTypes: ["staff"], weight: 7, unlock: { cities: ["oakvale"], minRepLevel: 3 } },

  { id: "guild_merc_company", name: "Mercenary Company", guildType: "mercenary", preferredItemTypes: ["axe", "sword"], weight: 8, unlock: { cities: ["oakvale"], minRepLevel: 4 } },
  { id: "guild_caravan_guard", name: "Caravan Guard", guildType: "caravan", preferredItemTypes: ["sword", "bow"], weight: 7, unlock: { cities: ["oakvale"], minRepLevel: 4 } },

  { id: "guild_veteran_company", name: "Veteran Company", guildType: "royal", preferredItemTypes: ["sword", "axe", "staff"], weight: 4, unlock: { cities: ["oakvale"], minRepLevel: 5, minTier: 2 } },
  { id: "guild_arcane_envoy", name: "Arcane Envoy", guildType: "mage", preferredItemTypes: ["staff"], weight: 3, unlock: { cities: ["oakvale"], minRepLevel: 5, minTier: 2 } }
];
```

---

# Legendary name pool

```ts
export const legendaryNamePool = [
  { id: "legend_mooncleaver", name: "Mooncleaver", allowedItemTypes: ["sword", "axe"], theme: "moon", weight: 4, unlock: { minTier: 3 } },
  { id: "legend_starbinder", name: "Starbinder", allowedItemTypes: ["staff"], theme: "arcane", weight: 4, unlock: { minTier: 3 } },
  { id: "legend_goblinbane", name: "Goblinbane", allowedItemTypes: ["sword", "bow", "axe"], theme: "war", weight: 5, unlock: { minTier: 3 } },
  { id: "legend_last_ember", name: "The Last Ember", allowedItemTypes: ["sword", "staff"], theme: "fire", weight: 3, unlock: { minTier: 3 } },
  { id: "legend_oathsplitter", name: "Oathsplitter", allowedItemTypes: ["axe", "sword"], theme: "war", weight: 3, unlock: { minTier: 3 } },
  { id: "legend_silver_bough", name: "Silver Bough", allowedItemTypes: ["bow", "staff"], theme: "forest", weight: 4, unlock: { minTier: 3 } },
  { id: "legend_nightstring", name: "Nightstring", allowedItemTypes: ["bow"], theme: "shadow", weight: 3, unlock: { minTier: 3 } },
  { id: "legend_crownshard", name: "Crownshard", allowedItemTypes: ["sword"], theme: "war", weight: 2, unlock: { minTier: 3 } },
  { id: "legend_ashen_vow", name: "Ashen Vow", allowedItemTypes: ["staff", "axe"], theme: "fire", weight: 2, unlock: { minTier: 3 } },
  { id: "legend_dragonsbreath_magimania", name: "Dragonsbreath of Magimania", allowedItemTypes: ["staff"], theme: "dragon", weight: 1, unlock: { minTier: 5, minRepLevel: 5, tags: ["post_mvp"] } }
];
```

---

# Feedback templates

```ts
export const feedbackTemplates = [
  {
    id: "feedback_guard_gate_success",
    eventType: "success",
    allowedHeroClasses: ["guard"],
    allowedItemTypes: ["sword", "axe"],
    minRarity: "common",
    text: "{heroName} used your {itemName} to defend Oakvale's north gate.",
    rewardType: "reputation",
    weight: 10,
    unlock: { cities: ["oakvale"], minRepLevel: 1 }
  },
  {
    id: "feedback_guard_bandit",
    eventType: "success",
    allowedHeroClasses: ["guard", "mercenary"],
    allowedItemTypes: ["sword", "axe"],
    minRarity: "fine",
    text: "{heroName} drove off roadside bandits with your {itemName}.",
    rewardType: "gold",
    weight: 8,
    unlock: { cities: ["oakvale"], minRepLevel: 1 }
  },
  {
    id: "feedback_ranger_wolf_hunt",
    eventType: "success",
    allowedHeroClasses: ["ranger"],
    allowedItemTypes: ["bow"],
    minRarity: "fine",
    text: "{heroName} says your {itemName} flew true during a wolf hunt.",
    rewardType: "material",
    weight: 9,
    unlock: { cities: ["oakvale"], minRepLevel: 2 }
  },
  {
    id: "feedback_ranger_scout",
    eventType: "praise",
    allowedHeroClasses: ["ranger"],
    allowedItemTypes: ["bow", "sword"],
    minRarity: "rare",
    text: "{heroName} returned from the old trail with praise for your {itemName}.",
    rewardType: "reputation",
    weight: 6,
    unlock: { cities: ["oakvale"], minRepLevel: 2 }
  },
  {
    id: "feedback_mage_trial",
    eventType: "praise",
    allowedHeroClasses: ["mage"],
    allowedItemTypes: ["staff"],
    minRarity: "rare",
    text: "{heroName} channeled unstable magic through your {itemName} and survived.",
    rewardType: "reputation",
    weight: 7,
    unlock: { cities: ["oakvale"], minRepLevel: 3 }
  },
  {
    id: "feedback_mercenary_duel",
    eventType: "success",
    allowedHeroClasses: ["mercenary", "duelist"],
    allowedItemTypes: ["axe", "sword"],
    minRarity: "fine",
    text: "{heroName} won a tavern duel using your {itemName}. Your mark is getting noticed.",
    rewardType: "reputation",
    weight: 7,
    unlock: { cities: ["oakvale"], minRepLevel: 4 }
  },
  {
    id: "feedback_veteran_campaign",
    eventType: "praise",
    allowedHeroClasses: ["veteran"],
    allowedItemTypes: ["sword", "axe", "staff"],
    minRarity: "epic",
    text: "{heroName} carried your {itemName} through a brutal campaign and returned with stories.",
    rewardType: "reputation",
    weight: 4,
    unlock: { cities: ["oakvale"], minRepLevel: 5 }
  },
  {
    id: "feedback_legendary_song",
    eventType: "legendary_reaction",
    minRarity: "legendary",
    text: "Word spreads quickly: {heroName} now carries {itemName}, a weapon worthy of songs.",
    rewardType: "reputation",
    weight: 1,
    unlock: { minTier: 3 }
  }
];
```

---

# Guild contract starter templates

```ts
export const guildContractTemplates = [
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
];
```

---

# Hero commission starter templates

```ts
export const heroCommissionTemplates = [
  {
    id: "hero_guard_sword",
    heroClass: "guard",
    requiredRepLevel: 1,
    requiredTier: 1,
    requiredBlueprintId: "bp_sword_base",
    requiredItemType: "sword",
    minLevelRange: [2, 4],
    preferredAffix: "sharp",
    goldMultiplierRange: [0.5, 0.75],
    reputationRewardRange: [25, 40],
    baseFeedbackChance: 0.35,
    weight: 12,
    unlock: { cities: ["oakvale"] }
  },
  {
    id: "hero_ranger_bow",
    heroClass: "ranger",
    requiredRepLevel: 2,
    requiredTier: 1,
    requiredBlueprintId: "bp_bow_base",
    requiredItemType: "bow",
    minLevelRange: [4, 7],
    preferredAffix: "precise",
    goldMultiplierRange: [0.55, 0.8],
    reputationRewardRange: [40, 65],
    baseFeedbackChance: 0.4,
    weight: 10,
    unlock: { cities: ["oakvale"] }
  },
  {
    id: "hero_mage_staff",
    heroClass: "mage",
    requiredRepLevel: 3,
    requiredTier: 1,
    requiredBlueprintId: "bp_staff_base",
    requiredItemType: "staff",
    minLevelRange: [6, 10],
    preferredAffix: "arcane",
    bonusRarity: "rare",
    goldMultiplierRange: [0.55, 0.85],
    reputationRewardRange: [60, 90],
    baseFeedbackChance: 0.45,
    weight: 8,
    unlock: { cities: ["oakvale"] }
  },
  {
    id: "hero_mercenary_axe",
    heroClass: "mercenary",
    requiredRepLevel: 4,
    requiredTier: 1,
    requiredBlueprintId: "bp_axe_base",
    requiredItemType: "axe",
    minLevelRange: [8, 12],
    preferredAffix: "heavy",
    bonusRarity: "rare",
    goldMultiplierRange: [0.6, 0.9],
    reputationRewardRange: [85, 130],
    baseFeedbackChance: 0.5,
    weight: 8,
    unlock: { cities: ["oakvale"] }
  },
  {
    id: "hero_duelist_advanced_sword",
    heroClass: "duelist",
    requiredRepLevel: 5,
    requiredTier: 2,
    requiredBlueprintId: "bp_sword_basic_pattern",
    requiredItemType: "sword",
    minLevelRange: [12, 15],
    preferredAffix: "balanced",
    bonusRarity: "epic",
    goldMultiplierRange: [0.6, 0.9],
    reputationRewardRange: [120, 180],
    baseFeedbackChance: 0.55,
    weight: 5,
    unlock: { cities: ["oakvale"] }
  }
];
```

---

# Starter content target

MVP első buildhez minimum:

| Content | Minimum |
|---|---:|
| Hero names | 15 |
| Guild names | 10 |
| Feedback templates | 8 |
| Legendary names | 10 |
| Guild contract templates | 5 |
| Hero commission templates | 5 |

Ez elég a prototype-hoz, de release MVP-hez bővíteni kell.
