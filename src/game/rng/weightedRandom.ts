import type { Rng } from "./rng";

export function pickWeighted<T extends { weight: number }>(
  items: T[],
  rng: Rng
): T | undefined {
  const total = items.reduce((sum, item) => sum + item.weight, 0);

  if (total <= 0) return undefined;

  let roll = rng.nextFloat() * total;

  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }

  return items[items.length - 1];
}
