import { useCallback, useEffect, useMemo, useState } from "react";
import { createInitialGameState } from "./createInitialGameState";
import type { EntityId } from "../../types/common.types";
import type { GameState } from "../../types/gameState.types";
import { createSequenceRng, defaultRng, type Rng } from "../rng/rng";
import {
  acceptGuildContractAction,
  advanceGame,
  deliverItemToGuildContractAction,
  deliverItemToHeroCommissionAction,
  dismissFeedbackEventAction,
  dismissHeroCommissionAction,
  forceCompleteCraftAction,
  grantDebugReputation,
  grantDebugResources,
  purchaseBlueprintAction,
  purchaseWorkshopUpgradeAction,
  sellItemAction,
  startCraftAction,
  upgradeForgeTierAction
} from "./actions";
import { clearSave, loadGame, saveGame } from "../systems/saveSystem";

type GameStoreActions = {
  tick: () => void;
  startCraft: (blueprintId: EntityId) => void;
  startSwordCraft: () => void;
  sellItem: (itemId: EntityId) => void;
  purchaseBlueprint: (blueprintId: EntityId) => void;
  purchaseWorkshopUpgrade: (upgradeId: EntityId) => void;
  upgradeForgeTier: (targetTier: number) => void;
  acceptGuildContract: (contractId: EntityId) => void;
  deliverItemToGuildContract: (itemId: EntityId, contractId: EntityId) => void;
  deliverItemToHeroCommission: (itemId: EntityId, commissionId: EntityId) => void;
  dismissHeroCommission: (commissionId: EntityId) => void;
  dismissFeedback: (feedbackId: EntityId) => void;
  forceCompleteCraft: (rng?: Rng) => void;
  forceRareCraft: () => void;
  forceEpicCraft: () => void;
  addIron: () => void;
  addWood: () => void;
  addGold: () => void;
  addReputation: () => void;
  resetSave: () => void;
  saveNow: () => void;
};

export type GameStore = {
  state: GameState;
  lastError?: string;
  actions: GameStoreActions;
};

const SWORD_BLUEPRINT_ID = "bp_sword_base";

export function useGameStore(): GameStore {
  const [state, setState] = useState<GameState>(() => loadGame(Date.now()));
  const [lastError, setLastError] = useState<string>();

  const applyStateUpdate = useCallback(
    (
      updater: (previousState: GameState, now: number) => GameState,
      options: { saveAfter?: boolean } = {}
    ) => {
      setState((previousState) => {
        const now = Date.now();

        try {
          const nextState = updater(previousState, now);
          setLastError(undefined);

          if (options.saveAfter) {
            saveGame(nextState, now);
          }

          return nextState;
        } catch (error) {
          setLastError(error instanceof Error ? error.message : "Unknown game error");
          return previousState;
        }
      });
    },
    []
  );

  const actions = useMemo<GameStoreActions>(() => {
    const completeActiveCraftWithRng = (rng = defaultRng) => {
      applyStateUpdate(
        (previousState, now) => {
          const craft = Object.values(previousState.workshop.activeCraftsById)[0];
          if (!craft) throw new Error("No active craft to complete");
          return forceCompleteCraftAction(previousState, craft.craftId, { now, rng });
        },
        { saveAfter: true }
      );
    };

    return {
      tick: () => {
        setState((previousState) => {
          const now = Date.now();
          const beforeCrafted = previousState.player.craftedItemCount;
          const beforeLogCount = previousState.log.entries.length;
          const nextState = advanceGame(previousState, now, defaultRng);

          if (
            nextState.player.craftedItemCount !== beforeCrafted ||
            nextState.log.entries.length !== beforeLogCount
          ) {
            saveGame(nextState, now);
          }

          return nextState;
        });
      },
      startCraft: (blueprintId) => {
        applyStateUpdate(
          (previousState, now) =>
            startCraftAction(previousState, blueprintId, {
              now,
              rng: defaultRng
            }),
          { saveAfter: true }
        );
      },
      startSwordCraft: () => {
        applyStateUpdate(
          (previousState, now) =>
            startCraftAction(previousState, SWORD_BLUEPRINT_ID, {
              now,
              rng: defaultRng
            }),
          { saveAfter: true }
        );
      },
      sellItem: (itemId) => {
        applyStateUpdate((previousState, now) => sellItemAction(previousState, itemId, now), {
          saveAfter: true
        });
      },
      purchaseBlueprint: (blueprintId) => {
        applyStateUpdate(
          (previousState, now) => purchaseBlueprintAction(previousState, blueprintId, now),
          { saveAfter: true }
        );
      },
      purchaseWorkshopUpgrade: (upgradeId) => {
        applyStateUpdate(
          (previousState, now) => purchaseWorkshopUpgradeAction(previousState, upgradeId, now),
          { saveAfter: true }
        );
      },
      upgradeForgeTier: (targetTier) => {
        applyStateUpdate(
          (previousState, now) => upgradeForgeTierAction(previousState, targetTier, now),
          { saveAfter: true }
        );
      },
      acceptGuildContract: (contractId) => {
        applyStateUpdate(
          (previousState, now) => acceptGuildContractAction(previousState, contractId, now),
          { saveAfter: true }
        );
      },
      deliverItemToGuildContract: (itemId, contractId) => {
        applyStateUpdate(
          (previousState, now) =>
            deliverItemToGuildContractAction(previousState, itemId, contractId, {
              now,
              rng: defaultRng
            }),
          { saveAfter: true }
        );
      },
      deliverItemToHeroCommission: (itemId, commissionId) => {
        applyStateUpdate(
          (previousState, now) =>
            deliverItemToHeroCommissionAction(previousState, itemId, commissionId, {
              now,
              rng: defaultRng
            }),
          { saveAfter: true }
        );
      },
      dismissHeroCommission: (commissionId) => {
        applyStateUpdate(
          (previousState, now) => dismissHeroCommissionAction(previousState, commissionId, now),
          { saveAfter: true }
        );
      },
      dismissFeedback: (feedbackId) => {
        applyStateUpdate(
          (previousState) => dismissFeedbackEventAction(previousState, feedbackId),
          { saveAfter: true }
        );
      },
      forceCompleteCraft: completeActiveCraftWithRng,
      forceRareCraft: () => {
        const rareRng = createSequenceRng([0.2, 0.97, 0]);
        completeActiveCraftWithRng(rareRng);
      },
      forceEpicCraft: () => {
        const epicRng = createSequenceRng([0.2, 0.998, 0]);
        completeActiveCraftWithRng(epicRng);
      },
      addIron: () => {
        applyStateUpdate((previousState) => grantDebugResources(previousState, { ironOre: 10 }), {
          saveAfter: true
        });
      },
      addWood: () => {
        applyStateUpdate((previousState) => grantDebugResources(previousState, { wood: 10 }), {
          saveAfter: true
        });
      },
      addGold: () => {
        applyStateUpdate((previousState) => grantDebugResources(previousState, { gold: 100 }), {
          saveAfter: true
        });
      },
      addReputation: () => {
        applyStateUpdate(
          (previousState, now) => grantDebugReputation(previousState, 100, now),
          { saveAfter: true }
        );
      },
      resetSave: () => {
        const now = Date.now();
        clearSave();
        setLastError(undefined);
        setState(createInitialGameState(now));
      },
      saveNow: () => {
        applyStateUpdate((previousState) => previousState, { saveAfter: true });
      }
    };
  }, [applyStateUpdate]);

  useEffect(() => {
    const id = window.setInterval(() => {
      actions.tick();
    }, 1000);

    return () => window.clearInterval(id);
  }, [actions]);

  useEffect(() => {
    const id = window.setInterval(() => {
      actions.saveNow();
    }, 20_000);

    return () => window.clearInterval(id);
  }, [actions]);

  return {
    state,
    lastError,
    actions
  };
}
