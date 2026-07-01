import { Coins, Gem, Hammer } from "lucide-react";
import { Button } from "../common/Button";
import { INVENTORY_CONFIG } from "../../config/inventory.config";
import type { ItemState } from "../../types/item.types";
import { formatLabel, formatRarity } from "../../utils/format";

type ItemCardProps = {
  item: ItemState;
  onSell?: (itemId: string) => void;
  compact?: boolean;
  matchingOrderLabels?: string[];
  isMasterworkEligible?: boolean;
};

export function ItemCard({
  item,
  onSell,
  compact = false,
  matchingOrderLabels = [],
  isMasterworkEligible = false
}: ItemCardProps) {
  return (
    <article className={`item-card ${item.rarity}`}>
      <div className="item-row">
        <div>
          <div className="rarity">{formatRarity(item.rarity)}</div>
          <div className="item-name">{item.displayName}</div>
        </div>
        <div className="muted">Lv {item.level}</div>
      </div>

      <dl className="stat-list" style={{ marginTop: 12 }}>
        <div>
          <dt>
            <Hammer size={14} aria-hidden="true" /> Power
          </dt>
          <dd>{item.power}</dd>
        </div>
        <div>
          <dt>
            <Coins size={14} aria-hidden="true" /> Sell Value
          </dt>
          <dd>{item.sellValue} Gold</dd>
        </div>
      </dl>

      {item.affix ? (
        <div className="affix-line">
          <Gem size={14} aria-hidden="true" /> Affix: {formatLabel(item.affix.type)}{" "}
          {item.affix.value > 0 ? `+${item.affix.value}` : ""}
        </div>
      ) : null}

      {matchingOrderLabels.length ? (
        <div className="affix-line">
          Matches: {matchingOrderLabels.join(", ")}
        </div>
      ) : null}

      {isMasterworkEligible ? (
        <div className="masterwork-badge">Eligible for Masterwork</div>
      ) : null}

      {!compact && onSell ? (
        <div className="button-row">
          <Button onClick={() => onSell(item.itemId)}>Sell to Market</Button>
          <span className="muted">
            Pays {Math.floor(item.sellValue * INVENTORY_CONFIG.marketSellMultiplier)} Gold, 0 Rep
          </span>
        </div>
      ) : null}
    </article>
  );
}
