import { ItemCard } from "../../components/game/ItemCard";
import type { ItemState } from "../../types/item.types";

type CraftResultPanelProps = {
  item?: ItemState;
  onSell: (itemId: string) => void;
  isMasterworkEligible?: boolean;
};

export function CraftResultPanel({
  item,
  onSell,
  isMasterworkEligible = false
}: CraftResultPanelProps) {
  return (
    <section className="panel">
      <h2 className="panel-title">Last Craft Result</h2>
      {item ? (
        <ItemCard
          item={item}
          isMasterworkEligible={isMasterworkEligible}
          onSell={item.state === "inventory" ? onSell : undefined}
        />
      ) : (
        <p className="muted">No crafted items yet.</p>
      )}
    </section>
  );
}
