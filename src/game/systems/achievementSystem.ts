import { CRAFT_ACHIEVEMENTS, type CraftAchievementConfig } from "../../config/achievements.config";
import type { EntityId, TimestampMs } from "../../types/common.types";
import type { GameState } from "../../types/gameState.types";
import type { ItemState } from "../../types/item.types";
import { addLogEntry } from "./eventLogSystem";

export function getCraftAchievementForItem(
  item: ItemState
): CraftAchievementConfig | undefined {
  if (item.rarity !== "epic" && item.rarity !== "legendary") return undefined;

  return CRAFT_ACHIEVEMENTS.find(
    (achievement) =>
      achievement.itemType === item.itemType && achievement.rarity === item.rarity
  );
}

export function unlockCraftAchievementForItem(
  state: GameState,
  item: ItemState,
  now: TimestampMs
): GameState {
  const achievement = getCraftAchievementForItem(item);

  if (!achievement) return state;
  if (state.achievements.unlockedAchievementIds.includes(achievement.id)) return state;

  const nextState: GameState = {
    ...state,
    achievements: {
      unlockedAchievementIds: [
        ...state.achievements.unlockedAchievementIds,
        achievement.id
      ],
      unlockedAtById: {
        ...state.achievements.unlockedAtById,
        [achievement.id]: now
      }
    }
  };

  return addLogEntry(nextState, {
    type: "achievement_unlocked",
    text: `Achievement unlocked: ${achievement.name}.`,
    relatedItemId: item.itemId,
    createdAt: now
  });
}

export function getUnlockedCraftAchievements(
  state: GameState
): Array<CraftAchievementConfig & { unlockedAt: TimestampMs }> {
  return state.achievements.unlockedAchievementIds
    .map((achievementId: EntityId) => {
      const achievement = CRAFT_ACHIEVEMENTS.find(
        (candidate) => candidate.id === achievementId
      );
      if (!achievement) return undefined;

      return {
        ...achievement,
        unlockedAt: state.achievements.unlockedAtById[achievementId] ?? 0
      };
    })
    .filter((achievement) => achievement !== undefined);
}
