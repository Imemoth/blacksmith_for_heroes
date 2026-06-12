import { createInitialGameState } from "../../src/game/state/createInitialGameState";
import type { Rng } from "../../src/game/rng/rng";
import type { StorageLike } from "../../src/game/systems/saveSystem";

export function makeTestGameState(now = 0) {
  return createInitialGameState(now);
}

export function createTestRng(values: number[]): Rng {
  let index = 0;

  return {
    nextFloat: () => {
      const value = values[Math.min(index, values.length - 1)] ?? 0;
      index += 1;
      return value;
    }
  };
}

export function createMemoryStorage(): StorageLike & { dump: () => Record<string, string> } {
  const storage = new Map<string, string>();

  return {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => {
      storage.set(key, value);
    },
    removeItem: (key) => {
      storage.delete(key);
    },
    dump: () => Object.fromEntries(storage)
  };
}
