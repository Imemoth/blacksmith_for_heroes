import type { CityContent } from "../types/order.types";

export const CITIES = [
  {
    id: "oakvale",
    name: "Oakvale",
    theme: "starter_forest_town",
    minRepLevel: 1
  }
] as const satisfies CityContent[];
