export type Rng = {
  nextFloat(): number;
};

export type SystemContext = {
  now: number;
  rng: Rng;
};

export const defaultRng: Rng = {
  nextFloat: () => Math.random()
};

export function createSequenceRng(values: number[]): Rng {
  let index = 0;

  return {
    nextFloat: () => {
      const value = values[Math.min(index, values.length - 1)] ?? 0;
      index += 1;
      return Math.max(0, Math.min(0.999999, value));
    }
  };
}
