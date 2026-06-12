import { Hammer, RotateCcw, Save, Swords } from "lucide-react";
import { Button } from "../../components/common/Button";
import type { GameStore } from "../../game/state/gameStore";
import { saveGame } from "../../game/systems/saveSystem";

type DebugPanelProps = {
  store: GameStore;
};

export function DebugPanel({ store }: DebugPanelProps) {
  const hasCraft = Object.keys(store.state.workshop.activeCraftsById).length > 0;

  return (
    <section className="panel">
      <h2 className="panel-title">Debug</h2>
      <div className="debug-grid">
        <Button variant="ghost" onClick={store.actions.addIron}>+10 Iron</Button>
        <Button variant="ghost" onClick={store.actions.addWood}>+10 Wood</Button>
        <Button variant="ghost" onClick={store.actions.addGold}>+100 Gold</Button>
        <Button variant="ghost" onClick={() => store.actions.forceCompleteCraft()} disabled={!hasCraft}>
          <Hammer size={16} aria-hidden="true" /> Force Complete
        </Button>
        <Button variant="ghost" onClick={store.actions.forceRareCraft} disabled={!hasCraft}>
          <Swords size={16} aria-hidden="true" /> Force Rare
        </Button>
        <Button variant="ghost" onClick={store.actions.forceEpicCraft} disabled={!hasCraft}>
          <Swords size={16} aria-hidden="true" /> Force Epic
        </Button>
        <Button variant="ghost" onClick={store.actions.resetSave}>
          <RotateCcw size={16} aria-hidden="true" /> Reset Save
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            const save = saveGame(store.state, Date.now());
            navigator.clipboard?.writeText(JSON.stringify(save, null, 2));
          }}
        >
          <Save size={16} aria-hidden="true" /> Export Save
        </Button>
      </div>
    </section>
  );
}
