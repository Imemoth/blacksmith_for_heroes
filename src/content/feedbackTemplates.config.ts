import type { ItemType } from "../types/common.types";

export type FeedbackTemplateContent = {
  id: string;
  text: string;
  weight: number;
  allowedItemTypes?: readonly ItemType[];
};

export const HERO_FEEDBACK_TEMPLATES: FeedbackTemplateContent[] = [
  {
    id: "battle_held_well",
    text: "{heroName} returned after battle. The {itemName} held well.",
    weight: 10
  },
  {
    id: "edge_needed",
    text: "{heroName} says the {itemName} gave them the edge they needed.",
    weight: 8,
    allowedItemTypes: ["bow", "sword", "axe"]
  },
  {
    id: "expedition_survived",
    text: "The {itemType} survived the expedition and {heroName} speaks highly of your work.",
    weight: 8
  },
  {
    id: "staff_expedition",
    text: "{heroName} says the {itemName} carried them through a dangerous expedition.",
    weight: 7,
    allowedItemTypes: ["staff"]
  }
];
