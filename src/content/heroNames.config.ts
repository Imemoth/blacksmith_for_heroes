import type { HeroNameContent } from "../types/order.types";

export const HERO_NAME_POOL = [
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
] as const satisfies HeroNameContent[];
