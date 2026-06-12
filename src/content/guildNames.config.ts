import type { GuildNameContent } from "../types/order.types";

export const GUILD_NAME_POOL = [
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
] as const satisfies GuildNameContent[];
