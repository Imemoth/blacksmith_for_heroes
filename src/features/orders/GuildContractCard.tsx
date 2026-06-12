import { Check, PackageCheck } from "lucide-react";
import { Button } from "../../components/common/Button";
import { ItemCard } from "../../components/game/ItemCard";
import type { EntityId } from "../../types/common.types";
import type { GameState, GuildContractState } from "../../types/gameState.types";
import { formatLabel, formatTimer } from "../../utils/format";
import { getMatchingGuildInventoryItems } from "../../game/state/selectors";

type GuildContractCardProps = {
  contract: GuildContractState;
  state: GameState;
  now: number;
  onAccept: (contractId: EntityId) => void;
  onDeliver: (itemId: EntityId, contractId: EntityId) => void;
};

export function GuildContractCard({
  contract,
  state,
  now,
  onAccept,
  onDeliver
}: GuildContractCardProps) {
  const matchingItems = getMatchingGuildInventoryItems(state, contract);
  const rotateText =
    contract.status === "offered" && contract.rotateAt
      ? `Rotates in ${formatTimer(contract.rotateAt - now)}`
      : "Accepted contracts do not rotate";

  return (
    <article className="order-card">
      <div className="order-card-header">
        <div>
          <div className="rarity">{formatLabel(contract.status)}</div>
          <h3>{contract.guildName}</h3>
        </div>
        <div className="muted">{formatLabel(contract.guildType)}</div>
      </div>

      <div className="order-requirements">
        {contract.requiredItems.map((requirement) => (
          <div key={requirement.itemType} className="order-requirement">
            <span>
              {formatLabel(requirement.itemType)} Lv {contract.minLevel}+
            </span>
            <strong>
              {requirement.deliveredItemIds.length}/{requirement.quantityRequired}
            </strong>
          </div>
        ))}
      </div>

      <dl className="stat-list">
        <div>
          <dt>Reward</dt>
          <dd>{contract.goldReward} Gold</dd>
        </div>
        <div>
          <dt>Reputation</dt>
          <dd>{contract.reputationReward} Rep</dd>
        </div>
      </dl>

      <p className="muted">{rotateText}</p>

      {contract.status === "offered" ? (
        <div className="button-row">
          <Button onClick={() => onAccept(contract.contractId)}>
            <Check size={16} aria-hidden="true" /> Accept Contract
          </Button>
        </div>
      ) : null}

      {contract.status === "accepted" ? (
        <div className="delivery-list">
          <h4>Matching Inventory</h4>
          {matchingItems.length ? (
            matchingItems.map((item) => (
              <div className="delivery-row" key={item.itemId}>
                <ItemCard compact item={item} />
                <Button onClick={() => onDeliver(item.itemId, contract.contractId)}>
                  <PackageCheck size={16} aria-hidden="true" /> Deliver
                </Button>
              </div>
            ))
          ) : (
            <p className="muted">No matching inventory item yet.</p>
          )}
        </div>
      ) : null}
    </article>
  );
}
