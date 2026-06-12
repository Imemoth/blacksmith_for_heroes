import { INVENTORY_CONFIG } from "../../config/inventory.config";
import type { GameState } from "../../types/gameState.types";
import type { ItemState } from "../../types/item.types";
import { addLogEntry } from "./eventLogSystem";

export function addItemToInventory(state: GameState, item: ItemState): GameState {
  if (state.inventory.itemIds.length >= state.inventory.maxSlots) {
    throw new Error("Inventory full");
  }

  return {
    ...state,
    itemsById: {
      ...state.itemsById,
      [item.itemId]: item
    },
    inventory: {
      ...state.inventory,
      itemIds: [...state.inventory.itemIds, item.itemId]
    }
  };
}

export function sellItemToMarket(state: GameState, itemId: string, now = Date.now()): GameState {
  const item = state.itemsById[itemId];

  if (!item) throw new Error("Item not found");
  if (item.state !== "inventory") throw new Error("Item is not in inventory");

  const goldReward = Math.floor(item.sellValue * INVENTORY_CONFIG.marketSellMultiplier);

  const nextState: GameState = {
    ...state,
    resources: {
      ...state.resources,
      gold: state.resources.gold + goldReward
    },
    itemsById: {
      ...state.itemsById,
      [itemId]: {
        ...item,
        state: "sold_market"
      }
    },
    inventory: {
      ...state.inventory,
      itemIds: state.inventory.itemIds.filter((id) => id !== itemId)
    }
  };

  return addLogEntry(nextState, {
    type: "item_sold_market",
    text: `Sold ${item.displayName} to the market for ${goldReward} Gold.`,
    relatedItemId: item.itemId,
    createdAt: now
  });
}

export function shouldWarnBeforeGuildDelivery(item: ItemState): boolean {
  return item.rarity === "epic" || item.rarity === "legendary";
}
