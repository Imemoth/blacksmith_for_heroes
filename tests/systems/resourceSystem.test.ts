import { describe, expect, it } from "vitest";
import {
  canSpendResources,
  getResourceTickerProgress,
  spendResources,
  tickResources
} from "../../src/game/systems/resourceSystem";
import { makeTestGameState } from "../fixtures/testGameState";

describe("resourceSystem", () => {
  it("increases Iron Ore and Wood over time", () => {
    const state = makeTestGameState(0);
    const nextState = tickResources(state, 10_000);

    expect(nextState.resources.ironOre).toBe(13.25);
    expect(nextState.resources.wood).toBe(7);
  });

  it("respects Iron Ore and Wood caps", () => {
    const state = {
      ...makeTestGameState(0),
      resources: {
        ...makeTestGameState(0).resources,
        ironOre: 29,
        wood: 24
      }
    };

    const nextState = tickResources(state, 1000 * 60 * 60);

    expect(nextState.resources.ironOre).toBe(30);
    expect(nextState.resources.wood).toBe(25);
  });

  it("does not tick Gold or Forge Sigil", () => {
    const state = makeTestGameState(0);
    const nextState = tickResources(state, 1000 * 60 * 60);

    expect(nextState.resources.gold).toBe(0);
    expect(nextState.resources.forgeSigil).toBe(0);
  });

  it("does not reward negative elapsed time", () => {
    const state = makeTestGameState(10_000);
    const nextState = tickResources(state, 1_000);

    expect(nextState).toBe(state);
  });

  it("does not mutate state when spending fails", () => {
    const state = makeTestGameState(0);

    expect(canSpendResources(state, { ironOre: 999 })).toBe(false);
    expect(() => spendResources(state, { ironOre: 999 })).toThrow("Not enough resources");
    expect(state.resources.ironOre).toBe(12);
  });

  it("derives Ore and Wood production ticker progress without changing state", () => {
    const state = {
      ...makeTestGameState(0),
      resources: {
        ...makeTestGameState(0).resources,
        ironOre: 12.5,
        wood: 8.25
      }
    };

    expect(getResourceTickerProgress(state, "ironOre")).toMatchObject({
      resourceId: "ironOre",
      progress: 0.5,
      isCapped: false,
      secondsUntilNext: 4,
      ratePerSecond: 0.125
    });
    expect(getResourceTickerProgress(state, "wood")).toMatchObject({
      resourceId: "wood",
      progress: 0.25,
      isCapped: false,
      secondsUntilNext: 7.5,
      ratePerSecond: 0.1
    });
    expect(state.resources.ironOre).toBe(12.5);
    expect(state.resources.wood).toBe(8.25);
  });

  it("shows capped state for full production resources", () => {
    const state = {
      ...makeTestGameState(0),
      resources: {
        ...makeTestGameState(0).resources,
        ironOre: 30,
        wood: 25
      }
    };

    expect(getResourceTickerProgress(state, "ironOre")).toMatchObject({
      progress: 1,
      isCapped: true,
      secondsUntilNext: 0
    });
    expect(getResourceTickerProgress(state, "wood")).toMatchObject({
      progress: 1,
      isCapped: true,
      secondsUntilNext: 0
    });
  });
});
