import { ORDER_LEVEL_BANDS } from "../../config/orderScaling.config";
import { TIMING_CONFIG } from "../../config/timing.config";
import { GUILD_CONTRACT_TEMPLATES } from "../../content/guildContractTemplates.config";
import { GUILD_NAME_POOL } from "../../content/guildNames.config";
import { HERO_COMMISSION_TEMPLATES } from "../../content/heroCommissionTemplates.config";
import { HERO_NAME_POOL } from "../../content/heroNames.config";
import type { EntityId, HeroClass, ItemType } from "../../types/common.types";
import type {
  GameState,
  GuildContractState,
  GuildRequiredItemState,
  HeroCommissionState,
  HeroState
} from "../../types/gameState.types";
import type {
  ContentContext,
  GuildContractTemplate,
  HeroCommissionTemplate,
  UnlockScope,
  WeightedContent
} from "../../types/order.types";
import { createId } from "../../utils/ids";
import { defaultRng, type SystemContext } from "../rng/rng";
import { pickWeighted } from "../rng/weightedRandom";
import { getBlueprintConfig, isBlueprintUnlockedForShop } from "./blueprintSystem";
import { addLogEntry } from "./eventLogSystem";
import { addReputation } from "./reputationSystem";

type WeightedCandidate<T> = T & { weight: number };

export function initializeOrderState(
  state: GameState,
  context: SystemContext = { now: Date.now(), rng: defaultRng }
): GameState {
  const withGuilds = ensureGuildContractSlots(state, context);

  if (withGuilds.orders.nextHeroArrivalAt !== undefined) return withGuilds;

  return {
    ...withGuilds,
    orders: {
      ...withGuilds.orders,
      nextHeroArrivalAt: context.now + getHeroArrivalIntervalMs(withGuilds)
    }
  };
}

export function processOrderTimers(state: GameState, context: SystemContext): GameState {
  let nextState = ensureGuildContractSlots(state, context);
  nextState = rotateOfferedGuildContracts(nextState, context);
  nextState = expireHeroCommissions(nextState, context.now);
  nextState = spawnDueHeroCommission(nextState, context);
  return nextState;
}

export function ensureGuildContractSlots(state: GameState, context: SystemContext): GameState {
  let nextState = pruneInactiveGuildContractIds(state);

  while (nextState.orders.activeGuildContractIds.length < nextState.workshop.guildContractSlots) {
    const contract = generateGuildContract(nextState, context);
    if (!contract) break;

    nextState = {
      ...nextState,
      orders: {
        ...nextState.orders,
        guildContractsById: {
          ...nextState.orders.guildContractsById,
          [contract.contractId]: contract
        },
        activeGuildContractIds: [...nextState.orders.activeGuildContractIds, contract.contractId]
      }
    };
  }

  return nextState;
}

export function generateGuildContract(
  state: GameState,
  context: SystemContext
): GuildContractState | undefined {
  const contentContext = getContentContext(state);
  const template = pickWeightedContent(
    GUILD_CONTRACT_TEMPLATES.filter((candidate) =>
      isGuildTemplateEligible(state, candidate, contentContext)
    ),
    context
  );

  if (!template) return undefined;

  const guildName = pickWeightedContent(
    GUILD_NAME_POOL.filter(
      (candidate) =>
        candidate.guildType === template.guildType && isContentUnlocked(candidate, contentContext)
    ),
    context
  );
  const requiredItems = template.itemRequirements.map<GuildRequiredItemState>((requirement) => ({
    itemType: requirement.itemType,
    quantityRequired: rollIntegerRange([requirement.quantityMin, requirement.quantityMax], context),
    deliveredItemIds: []
  }));
  const rotateAfterMs =
    rollIntegerRange(
      [
        TIMING_CONFIG.guildOfferedRotationMinSeconds,
        TIMING_CONFIG.guildOfferedRotationMaxSeconds
      ],
      context
    ) * 1000;

  return {
    contractId: createId("contract"),
    templateId: template.id,
    guildName: guildName?.name ?? "Oakvale Guild",
    guildType: template.guildType,
    requiredItems,
    minLevel: rollScaledOrderMinLevel(state, isAdvancedGuildTemplate(template), context),
    goldReward: rollIntegerRange(template.goldRewardRange, context),
    reputationReward: rollIntegerRange(template.reputationRewardRange, context),
    status: "offered",
    generatedAt: context.now,
    rotateAt: context.now + rotateAfterMs
  };
}

export function acceptGuildContract(
  state: GameState,
  contractId: EntityId,
  now: number
): GameState {
  const contract = state.orders.guildContractsById[contractId];

  if (!contract) throw new Error("Guild contract not found");
  if (contract.status !== "offered") throw new Error("Guild contract is not offered");

  const nextState: GameState = {
    ...state,
    orders: {
      ...state.orders,
      guildContractsById: {
        ...state.orders.guildContractsById,
        [contractId]: {
          ...contract,
          status: "accepted",
          acceptedAt: now,
          rotateAt: undefined
        }
      }
    }
  };

  return addLogEntry(nextState, {
    type: "guild_contract_accepted",
    text: `Accepted ${contract.guildName} contract.`,
    relatedContractId: contractId,
    createdAt: now
  });
}

export function rotateOfferedGuildContracts(
  state: GameState,
  context: SystemContext
): GameState {
  let nextState = state;

  for (const contractId of state.orders.activeGuildContractIds) {
    const contract = nextState.orders.guildContractsById[contractId];
    if (!contract || contract.status !== "offered" || !contract.rotateAt) continue;
    if (contract.rotateAt > context.now) continue;

    const rotatedContract: GuildContractState = {
      ...contract,
      status: "rotated"
    };
    const stateWithoutActiveContract: GameState = {
      ...nextState,
      orders: {
        ...nextState.orders,
        guildContractsById: {
          ...nextState.orders.guildContractsById,
          [contractId]: rotatedContract
        },
        activeGuildContractIds: nextState.orders.activeGuildContractIds.filter(
          (id) => id !== contractId
        )
      }
    };
    const replacement = generateGuildContract(stateWithoutActiveContract, context);

    nextState = {
      ...stateWithoutActiveContract,
      orders: {
        ...stateWithoutActiveContract.orders,
        guildContractsById: {
          ...stateWithoutActiveContract.orders.guildContractsById,
          ...(replacement ? { [replacement.contractId]: replacement } : {})
        },
        activeGuildContractIds: replacement
          ? [...stateWithoutActiveContract.orders.activeGuildContractIds, replacement.contractId]
          : stateWithoutActiveContract.orders.activeGuildContractIds
      }
    };
    nextState = addLogEntry(nextState, {
      type: "guild_contract_rotated",
      text: `${contract.guildName} withdrew an offered contract.`,
      relatedContractId: contractId,
      createdAt: context.now
    });
  }

  return ensureGuildContractSlots(nextState, context);
}

export function canItemSatisfyGuildRequirement(
  item: { itemType: ItemType; level: number; state: string },
  contract: GuildContractState
): boolean {
  if (item.state !== "inventory") return false;
  if (item.level < contract.minLevel) return false;

  return contract.requiredItems.some(
    (requirement) =>
      requirement.itemType === item.itemType &&
      requirement.deliveredItemIds.length < requirement.quantityRequired
  );
}

export function deliverItemToGuildContract(
  state: GameState,
  itemId: EntityId,
  contractId: EntityId,
  context: SystemContext
): GameState {
  const contract = state.orders.guildContractsById[contractId];
  const item = state.itemsById[itemId];

  if (!contract) throw new Error("Guild contract not found");
  if (contract.status !== "accepted") throw new Error("Guild contract is not accepted");
  if (!item) throw new Error("Item not found");
  if (!canItemSatisfyGuildRequirement(item, contract)) {
    throw new Error("Item does not satisfy guild contract");
  }

  let itemDelivered = false;
  const updatedRequiredItems = contract.requiredItems.map((requirement) => {
    if (
      itemDelivered ||
      requirement.itemType !== item.itemType ||
      requirement.deliveredItemIds.length >= requirement.quantityRequired
    ) {
      return requirement;
    }

    itemDelivered = true;
    return {
      ...requirement,
      deliveredItemIds: [...requirement.deliveredItemIds, itemId]
    };
  });
  const updatedContract: GuildContractState = {
    ...contract,
    requiredItems: updatedRequiredItems
  };
  const isCompleted = updatedRequiredItems.every(
    (requirement) => requirement.deliveredItemIds.length >= requirement.quantityRequired
  );
  let nextState: GameState = {
    ...state,
    itemsById: {
      ...state.itemsById,
      [itemId]: {
        ...item,
        state: "assigned_guild",
        ownerId: contractId
      }
    },
    inventory: {
      ...state.inventory,
      itemIds: state.inventory.itemIds.filter((id) => id !== itemId)
    },
    orders: {
      ...state.orders,
      guildContractsById: {
        ...state.orders.guildContractsById,
        [contractId]: isCompleted
          ? { ...updatedContract, status: "completed", completedAt: context.now }
          : updatedContract
      }
    }
  };

  if (!isCompleted) return nextState;

  nextState = {
    ...nextState,
    resources: {
      ...nextState.resources,
      gold: nextState.resources.gold + contract.goldReward
    },
    player: {
      ...nextState.player,
      completedGuildContracts: nextState.player.completedGuildContracts + 1,
      completedOrdersTotal: nextState.player.completedOrdersTotal + 1
    },
    orders: {
      ...nextState.orders,
      activeGuildContractIds: nextState.orders.activeGuildContractIds.filter(
        (id) => id !== contractId
      )
    }
  };
  nextState = addReputation(nextState, contract.reputationReward, context.now);
  nextState = addLogEntry(nextState, {
    type: "guild_contract_completed",
    text: `Completed ${contract.guildName} contract for ${contract.goldReward} Gold and ${contract.reputationReward} Rep.`,
    relatedContractId: contractId,
    createdAt: context.now
  });

  return ensureGuildContractSlots(nextState, context);
}

export function generateHeroCommission(
  state: GameState,
  context: SystemContext
): HeroCommissionState | undefined {
  const contentContext = getContentContext(state);
  const hasMissingBlueprintHero = getActiveHeroCommissions(state).some(
    (commission) => commission.isMissingBlueprintCommission
  );
  const template = pickWeightedContent(
    HERO_COMMISSION_TEMPLATES.filter((candidate) =>
      isHeroTemplateEligible(state, candidate, contentContext, hasMissingBlueprintHero)
    ),
    context
  );

  if (!template) return undefined;

  const heroName = pickWeightedContent(
    HERO_NAME_POOL.filter(
      (candidate) =>
        (candidate.allowedClasses as readonly HeroClass[]).includes(template.heroClass) &&
        isContentUnlocked(candidate, contentContext)
    ),
    context
  );
  const isMissingBlueprintCommission = !state.blueprints.ownedBlueprintIds.includes(
    template.requiredBlueprintId
  );
  const heroId = createId("hero");
  const heroDisplayName = heroName?.name ?? fallbackHeroName(template.heroClass);

  return {
    commissionId: createId("commission"),
    templateId: template.id,
    heroId,
    heroName: heroDisplayName,
    heroClass: template.heroClass,
    requiredBlueprintId: template.requiredBlueprintId,
    requiredItemType: template.requiredItemType,
    minLevel: rollScaledOrderMinLevel(state, isAdvancedHeroTemplate(template), context),
    preferredAffix: template.preferredAffix,
    bonusRarity: "bonusRarity" in template ? template.bonusRarity : undefined,
    goldRewardMultiplier: rollDecimalRange(template.goldMultiplierRange, context),
    reputationReward: rollIntegerRange(template.reputationRewardRange, context),
    baseFeedbackChance: template.baseFeedbackChance,
    status: isMissingBlueprintCommission ? "waiting_for_blueprint" : "active",
    isMissingBlueprintCommission,
    arrivedAt: context.now,
    expiresAt: context.now + TIMING_CONFIG.heroActiveDurationSeconds * 1000
  };
}

export function spawnDueHeroCommission(state: GameState, context: SystemContext): GameState {
  const activeHeroIds = getActiveHeroCommissionIds(state);
  const nextHeroArrivalAt =
    state.orders.nextHeroArrivalAt ?? context.now + getHeroArrivalIntervalMs(state);

  if (activeHeroIds.length >= state.workshop.heroCommissionSlots || nextHeroArrivalAt > context.now) {
    return {
      ...state,
      orders: {
        ...state.orders,
        activeHeroCommissionIds: activeHeroIds,
        nextHeroArrivalAt
      }
    };
  }

  const commission = generateHeroCommission(
    {
      ...state,
      orders: {
        ...state.orders,
        activeHeroCommissionIds: activeHeroIds
      }
    },
    context
  );
  const nextArrival = context.now + getHeroArrivalIntervalMs(state);

  if (!commission) {
    return {
      ...state,
      orders: {
        ...state.orders,
        activeHeroCommissionIds: activeHeroIds,
        lastHeroArrivalAt: context.now,
        nextHeroArrivalAt: nextArrival
      }
    };
  }

  let nextState: GameState = {
    ...state,
    heroes: {
      ...state.heroes,
      heroesById: {
        ...state.heroes.heroesById,
        [commission.heroId]: createHeroState(commission, context.now)
      }
    },
    orders: {
      ...state.orders,
      heroCommissionsById: {
        ...state.orders.heroCommissionsById,
        [commission.commissionId]: commission
      },
      activeHeroCommissionIds: [...activeHeroIds, commission.commissionId],
      lastHeroArrivalAt: context.now,
      nextHeroArrivalAt: nextArrival
    }
  };

  nextState = addLogEntry(nextState, {
    type: "hero_commission_arrived",
    text: `${commission.heroName} arrived with a ${commission.requiredItemType} commission.`,
    relatedHeroId: commission.heroId,
    relatedCommissionId: commission.commissionId,
    createdAt: context.now
  });

  return nextState;
}

export function expireHeroCommissions(state: GameState, now: number): GameState {
  let nextState = state;

  for (const commissionId of state.orders.activeHeroCommissionIds) {
    const commission = nextState.orders.heroCommissionsById[commissionId];
    if (!commission || !isHeroCommissionActiveStatus(commission.status)) continue;
    if (commission.expiresAt > now) continue;

    nextState = {
      ...nextState,
      orders: {
        ...nextState.orders,
        heroCommissionsById: {
          ...nextState.orders.heroCommissionsById,
          [commissionId]: {
            ...commission,
            status: "expired"
          }
        },
        activeHeroCommissionIds: nextState.orders.activeHeroCommissionIds.filter(
          (id) => id !== commissionId
        )
      }
    };
    nextState = addLogEntry(nextState, {
      type: "hero_commission_expired",
      text: `${commission.heroName} left before the commission was fulfilled.`,
      relatedHeroId: commission.heroId,
      relatedCommissionId: commissionId,
      createdAt: now
    });
  }

  return nextState;
}

export function dismissHeroCommission(
  state: GameState,
  commissionId: EntityId,
  now: number
): GameState {
  const commission = state.orders.heroCommissionsById[commissionId];

  if (!commission) throw new Error("Hero commission not found");
  if (!isHeroCommissionActiveStatus(commission.status)) {
    throw new Error("Hero commission is not active");
  }
  if (state.orders.heroDismissCooldownUntil && state.orders.heroDismissCooldownUntil > now) {
    throw new Error("Hero dismiss is on cooldown");
  }

  const nextState: GameState = {
    ...state,
    orders: {
      ...state.orders,
      heroCommissionsById: {
        ...state.orders.heroCommissionsById,
        [commissionId]: {
          ...commission,
          status: "dismissed",
          dismissedAt: now
        }
      },
      activeHeroCommissionIds: state.orders.activeHeroCommissionIds.filter(
        (id) => id !== commissionId
      ),
      heroDismissCooldownUntil: now + TIMING_CONFIG.heroDismissCooldownSeconds * 1000
    }
  };

  return addLogEntry(nextState, {
    type: "hero_commission_dismissed",
    text: `Dismissed ${commission.heroName}'s commission.`,
    relatedHeroId: commission.heroId,
    relatedCommissionId: commissionId,
    createdAt: now
  });
}

export function canItemSatisfyHeroCommission(
  item: { itemType: ItemType; level: number; state: string },
  commission: HeroCommissionState
): boolean {
  return (
    item.state === "inventory" &&
    commission.status === "active" &&
    item.itemType === commission.requiredItemType &&
    item.level >= commission.minLevel
  );
}

export function completeHeroCommission(
  state: GameState,
  itemId: EntityId,
  commissionId: EntityId,
  context: SystemContext
): GameState {
  const commission = state.orders.heroCommissionsById[commissionId];
  const item = state.itemsById[itemId];

  if (!commission) throw new Error("Hero commission not found");
  if (commission.expiresAt <= context.now) throw new Error("Hero commission has expired");
  if (!item) throw new Error("Item not found");
  if (!canItemSatisfyHeroCommission(item, commission)) {
    throw new Error("Item does not satisfy hero commission");
  }

  const goldReward = Math.floor(item.sellValue * commission.goldRewardMultiplier);
  let nextState: GameState = {
    ...state,
    resources: {
      ...state.resources,
      gold: state.resources.gold + goldReward
    },
    itemsById: {
      ...state.itemsById,
      [itemId]: {
        ...item,
        state: "assigned_hero",
        ownerId: commission.heroId
      }
    },
    inventory: {
      ...state.inventory,
      itemIds: state.inventory.itemIds.filter((id) => id !== itemId)
    },
    player: {
      ...state.player,
      completedHeroCommissions: state.player.completedHeroCommissions + 1,
      completedOrdersTotal: state.player.completedOrdersTotal + 1
    },
    orders: {
      ...state.orders,
      heroCommissionsById: {
        ...state.orders.heroCommissionsById,
        [commissionId]: {
          ...commission,
          status: "completed",
          completedAt: context.now
        }
      },
      activeHeroCommissionIds: state.orders.activeHeroCommissionIds.filter(
        (id) => id !== commissionId
      )
    },
    heroes: {
      ...state.heroes,
      heroesById: {
        ...state.heroes.heroesById,
        [commission.heroId]: updateHeroAfterCommission(
          state.heroes.heroesById[commission.heroId] ?? createHeroState(commission, context.now),
          commission,
          itemId,
          context.now
        )
      }
    }
  };

  nextState = addReputation(nextState, commission.reputationReward, context.now);
  return addLogEntry(nextState, {
    type: "hero_commission_completed",
    text: `${commission.heroName} received ${item.displayName} for ${goldReward} Gold and ${commission.reputationReward} Rep.`,
    relatedHeroId: commission.heroId,
    relatedItemId: itemId,
    relatedCommissionId: commissionId,
    createdAt: context.now
  });
}

export function getActiveGuildContracts(state: GameState): GuildContractState[] {
  return state.orders.activeGuildContractIds
    .map((contractId) => state.orders.guildContractsById[contractId])
    .filter(
      (contract) => contract && (contract.status === "offered" || contract.status === "accepted")
    );
}

export function getActiveHeroCommissions(state: GameState): HeroCommissionState[] {
  return getActiveHeroCommissionIds(state)
    .map((commissionId) => state.orders.heroCommissionsById[commissionId])
    .filter((commission) => commission !== undefined);
}

export function getHeroArrivalIntervalMs(state: GameState): number {
  const repLevel = Math.min(5, Math.max(1, state.player.reputationLevel));
  const seconds =
    TIMING_CONFIG.heroArrivalSecondsByRepLevel[
      repLevel as keyof typeof TIMING_CONFIG.heroArrivalSecondsByRepLevel
    ];

  return seconds * 1000;
}

export function isBlueprintShopAvailable(state: GameState, blueprintId: EntityId): boolean {
  return isBlueprintUnlockedForShop(state, blueprintId);
}

export function getScaledOrderLevelBand(
  state: GameState,
  isAdvancedOrder = false
): readonly [number, number] {
  const rawBand =
    state.workshop.forgeTier >= 3 && isAdvancedOrder
      ? ORDER_LEVEL_BANDS.tier3Advanced
      : state.player.reputationLevel >= 5 && state.workshop.forgeTier >= 2
        ? ORDER_LEVEL_BANDS.rep5Tier2Or3
        : state.player.reputationLevel >= 4 && state.workshop.forgeTier >= 2
          ? ORDER_LEVEL_BANDS.rep4Tier2
          : state.player.reputationLevel >= 3
            ? ORDER_LEVEL_BANDS.rep3Tier1Or2
            : state.player.reputationLevel >= 2
              ? ORDER_LEVEL_BANDS.rep2Tier1
              : ORDER_LEVEL_BANDS.rep1Tier1;

  const cappedMax = Math.max(1, Math.min(rawBand.max, state.workshop.maxItemLevelCap));
  const cappedMin = Math.max(1, Math.min(rawBand.min, cappedMax));

  return [cappedMin, cappedMax];
}

export function isContentUnlocked(entry: { unlock?: UnlockScope }, context: ContentContext): boolean {
  const unlock = entry.unlock;
  if (!unlock) return true;
  if (unlock.cities && !unlock.cities.includes(context.cityId)) return false;
  if (unlock.minRepLevel && context.reputationLevel < unlock.minRepLevel) return false;
  if (unlock.minTier && context.forgeTier < unlock.minTier) return false;
  return true;
}

function isGuildTemplateEligible(
  state: GameState,
  template: GuildContractTemplate,
  context: ContentContext
): boolean {
  return (
    template.requiredRepLevel <= state.player.reputationLevel &&
    template.requiredTier <= state.workshop.forgeTier &&
    template.requiredOwnedBlueprints.every((blueprintId) =>
      state.blueprints.ownedBlueprintIds.includes(blueprintId)
    ) &&
    isContentUnlocked(template, context)
  );
}

function isHeroTemplateEligible(
  state: GameState,
  template: HeroCommissionTemplate,
  context: ContentContext,
  hasMissingBlueprintHero: boolean
): boolean {
  if (template.requiredRepLevel > state.player.reputationLevel) return false;
  if (template.requiredTier > state.workshop.forgeTier) return false;
  if (!isContentUnlocked(template, context)) return false;

  const ownsBlueprint = state.blueprints.ownedBlueprintIds.includes(template.requiredBlueprintId);
  if (ownsBlueprint) return true;
  if (hasMissingBlueprintHero) return false;

  return isBlueprintShopAvailable(state, template.requiredBlueprintId);
}

function rollScaledOrderMinLevel(
  state: GameState,
  isAdvancedOrder: boolean,
  context: SystemContext
): number {
  return rollIntegerRange(getScaledOrderLevelBand(state, isAdvancedOrder), context);
}

function isAdvancedGuildTemplate(template: GuildContractTemplate): boolean {
  return (
    template.requiredTier >= 3 ||
    template.requiredOwnedBlueprints.some(
      (blueprintId) => getBlueprintConfig(blueprintId)?.kind === "advanced"
    )
  );
}

function isAdvancedHeroTemplate(template: HeroCommissionTemplate): boolean {
  return (
    template.requiredTier >= 3 ||
    getBlueprintConfig(template.requiredBlueprintId)?.kind === "advanced"
  );
}

function pickWeightedContent<T extends WeightedContent>(
  entries: readonly T[],
  context: SystemContext
): T | undefined {
  return pickWeighted(entries as WeightedCandidate<T>[], context.rng);
}

function getContentContext(state: GameState): ContentContext {
  return {
    cityId: state.currentCityId,
    reputationLevel: state.player.reputationLevel,
    forgeTier: state.workshop.forgeTier
  };
}

function getActiveHeroCommissionIds(state: GameState): EntityId[] {
  return state.orders.activeHeroCommissionIds.filter((commissionId) => {
    const commission = state.orders.heroCommissionsById[commissionId];
    return commission && isHeroCommissionActiveStatus(commission.status);
  });
}

function pruneInactiveGuildContractIds(state: GameState): GameState {
  return {
    ...state,
    orders: {
      ...state.orders,
      activeGuildContractIds: state.orders.activeGuildContractIds.filter((contractId) => {
        const contract = state.orders.guildContractsById[contractId];
        return contract && (contract.status === "offered" || contract.status === "accepted");
      })
    }
  };
}

function rollIntegerRange([min, max]: readonly [number, number], context: SystemContext): number {
  return Math.floor(min + context.rng.nextFloat() * (max - min + 1));
}

function rollDecimalRange([min, max]: readonly [number, number], context: SystemContext): number {
  return min + context.rng.nextFloat() * (max - min);
}

function isHeroCommissionActiveStatus(status: HeroCommissionState["status"]): boolean {
  return status === "active" || status === "waiting_for_blueprint";
}

function fallbackHeroName(heroClass: HeroClass): string {
  return `${heroClass.charAt(0).toUpperCase()}${heroClass.slice(1)} Hero`;
}

function createHeroState(commission: HeroCommissionState, now: number): HeroState {
  return {
    heroId: commission.heroId,
    name: commission.heroName,
    heroClass: commission.heroClass,
    firstSeenAt: now,
    lastSeenAt: now,
    relationshipXp: 0,
    completedCommissionIds: [],
    equippedItemIds: [],
    historyEventIds: []
  };
}

function updateHeroAfterCommission(
  hero: HeroState,
  commission: HeroCommissionState,
  itemId: EntityId,
  now: number
): HeroState {
  return {
    ...hero,
    lastSeenAt: now,
    relationshipXp: hero.relationshipXp + commission.reputationReward,
    completedCommissionIds: [...hero.completedCommissionIds, commission.commissionId],
    equippedItemIds: [...hero.equippedItemIds, itemId]
  };
}
