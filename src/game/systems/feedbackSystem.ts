import { FEEDBACK_CONFIG } from "../../config/feedback.config";
import {
  HERO_FEEDBACK_TEMPLATES,
  type FeedbackTemplateContent
} from "../../content/feedbackTemplates.config";
import type { EntityId } from "../../types/common.types";
import type {
  FeedbackRewardState,
  GameState,
  HeroCommissionState,
  HeroFeedbackEventState
} from "../../types/gameState.types";
import type { ItemState } from "../../types/item.types";
import { createId } from "../../utils/ids";
import { clamp } from "../../utils/math";
import type { SystemContext } from "../rng/rng";
import { pickWeighted } from "../rng/weightedRandom";
import { addLogEntry } from "./eventLogSystem";
import { addReputation } from "./reputationSystem";

export function calculateFeedbackChance(
  commission: HeroCommissionState,
  item: ItemState
): number {
  const rarityBonus = FEEDBACK_CONFIG.rarityBonus[item.rarity] ?? 0;
  const preferredAffixBonus =
    commission.preferredAffix && item.affix?.type === commission.preferredAffix
      ? FEEDBACK_CONFIG.preferredAffixBonus
      : 0;
  const overdeliveryLevels = Math.max(0, item.level - commission.minLevel);
  const overdeliveryBonus = Math.min(
    overdeliveryLevels * FEEDBACK_CONFIG.overdeliveryBonusPerLevel,
    FEEDBACK_CONFIG.overdeliveryMaxBonus
  );

  return clamp(
    commission.baseFeedbackChance +
      rarityBonus +
      preferredAffixBonus +
      overdeliveryBonus,
    0,
    FEEDBACK_CONFIG.capChance
  );
}

export function maybeApplyHeroFeedback(
  state: GameState,
  commission: HeroCommissionState,
  item: ItemState,
  context: SystemContext
): GameState {
  const chance = calculateFeedbackChance(commission, item);

  if (context.rng.nextFloat() >= chance) return state;

  const template = selectFeedbackTemplate(item, context);
  const reward = getFeedbackReward(item);
  const feedbackId = createId("feedback");
  const feedbackText = renderFeedbackText(template, commission, item);
  const event: HeroFeedbackEventState = {
    feedbackId,
    heroId: commission.heroId,
    heroName: commission.heroName,
    commissionId: commission.commissionId,
    itemId: item.itemId,
    itemName: item.displayName,
    text: feedbackText,
    reward,
    createdAt: context.now
  };

  let nextState = applyFeedbackReward(state, reward, context.now);

  nextState = {
    ...nextState,
    feedback: {
      eventsById: {
        ...nextState.feedback.eventsById,
        [feedbackId]: event
      },
      pendingEventIds: [...nextState.feedback.pendingEventIds, feedbackId]
    },
    heroes: {
      ...nextState.heroes,
      heroesById: {
        ...nextState.heroes.heroesById,
        [commission.heroId]: {
          ...nextState.heroes.heroesById[commission.heroId],
          historyEventIds: [
            ...(nextState.heroes.heroesById[commission.heroId]?.historyEventIds ?? []),
            feedbackId
          ]
        }
      }
    }
  };

  return addLogEntry(nextState, {
    type: "hero_feedback",
    text: `${feedbackText}${formatRewardForLog(reward)}`,
    relatedHeroId: commission.heroId,
    relatedItemId: item.itemId,
    relatedCommissionId: commission.commissionId,
    createdAt: context.now
  });
}

export function dismissFeedbackEvent(state: GameState, feedbackId: EntityId): GameState {
  return {
    ...state,
    feedback: {
      ...state.feedback,
      pendingEventIds: state.feedback.pendingEventIds.filter((id) => id !== feedbackId)
    }
  };
}

function selectFeedbackTemplate(
  item: ItemState,
  context: SystemContext
): FeedbackTemplateContent {
  const eligibleTemplates = HERO_FEEDBACK_TEMPLATES.filter(
    (template) =>
      !template.allowedItemTypes ||
      (template.allowedItemTypes as readonly string[]).includes(item.itemType)
  );

  return (
    pickWeighted(eligibleTemplates, context.rng) ??
    HERO_FEEDBACK_TEMPLATES[0]
  );
}

function renderFeedbackText(
  template: FeedbackTemplateContent,
  commission: HeroCommissionState,
  item: ItemState
): string {
  return template.text
    .replaceAll("{heroName}", commission.heroName)
    .replaceAll("{itemName}", item.displayName)
    .replaceAll("{itemType}", item.itemType);
}

function getFeedbackReward(item: ItemState): FeedbackRewardState {
  return {
    ...FEEDBACK_CONFIG.rewardByRarity[item.rarity]
  };
}

function applyFeedbackReward(
  state: GameState,
  reward: FeedbackRewardState,
  now: number
): GameState {
  if (reward.amount <= 0 || reward.type === "none") return state;

  if (reward.type === "reputation") {
    return addReputation(state, reward.amount, now);
  }

  return {
    ...state,
    resources: {
      ...state.resources,
      [reward.type]: Math.min(
        state.resources[reward.type === "ironOre" ? "ironOreCap" : "woodCap"],
        state.resources[reward.type] + reward.amount
      )
    }
  };
}

function formatRewardForLog(reward: FeedbackRewardState): string {
  if (reward.amount <= 0 || reward.type === "none") return "";

  const label =
    reward.type === "reputation"
      ? "Rep"
      : reward.type === "ironOre"
        ? "Iron Ore"
        : "Wood";

  return ` Reward: +${reward.amount} ${label}.`;
}
