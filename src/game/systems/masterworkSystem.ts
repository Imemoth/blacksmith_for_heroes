import type { EntityId } from "../../types/common.types";
import type { GameState } from "../../types/gameState.types";
import type { ItemState } from "../../types/item.types";

const MASTERWORK_FRAME_BLUEPRINT_ID = "bp_masterwork_frame";

export function isItemMasterworkEligible(state: GameState, item: ItemState): boolean {
  return (
    state.workshop.forgeTier >= 3 &&
    state.player.reputationLevel >= 5 &&
    state.blueprints.ownedBlueprintIds.includes(MASTERWORK_FRAME_BLUEPRINT_ID) &&
    (item.rarity === "epic" || item.rarity === "legendary") &&
    item.level >= 15 &&
    item.state === "inventory"
  );
}

export function isItemIdMasterworkEligible(
  state: GameState,
  itemId: EntityId
): boolean {
  const item = state.itemsById[itemId];
  return item ? isItemMasterworkEligible(state, item) : false;
}
