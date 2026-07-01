import type { ItemType, Rarity } from "../types/common.types";

export type CraftAchievementConfig = {
  id: string;
  name: string;
  itemType: ItemType;
  rarity: Extract<Rarity, "epic" | "legendary">;
};

export const CRAFT_ACHIEVEMENTS: CraftAchievementConfig[] = [
  { id: "first_epic_sword", name: "First Epic Sword", itemType: "sword", rarity: "epic" },
  { id: "first_epic_bow", name: "First Epic Bow", itemType: "bow", rarity: "epic" },
  { id: "first_epic_axe", name: "First Epic Axe", itemType: "axe", rarity: "epic" },
  { id: "first_epic_staff", name: "First Epic Staff", itemType: "staff", rarity: "epic" },
  {
    id: "first_legendary_sword",
    name: "First Legendary Sword",
    itemType: "sword",
    rarity: "legendary"
  },
  {
    id: "first_legendary_bow",
    name: "First Legendary Bow",
    itemType: "bow",
    rarity: "legendary"
  },
  {
    id: "first_legendary_axe",
    name: "First Legendary Axe",
    itemType: "axe",
    rarity: "legendary"
  },
  {
    id: "first_legendary_staff",
    name: "First Legendary Staff",
    itemType: "staff",
    rarity: "legendary"
  }
];
