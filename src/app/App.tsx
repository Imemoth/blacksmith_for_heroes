import { useState } from "react";
import { ForgeTab } from "../features/forge/ForgeTab";
import { OrdersTab } from "../features/orders/OrdersTab";
import { PrestigeTab } from "../features/prestige/PrestigeTab";
import { ShopTab } from "../features/shop/ShopTab";
import { WorkshopTab } from "../features/workshop/WorkshopTab";
import { FeedbackDialog } from "../components/game/FeedbackDialog";
import { useGameStore } from "../game/state/gameStore";
import { getPendingFeedbackEvent } from "../game/state/selectors";

type ActiveTab = "forge" | "orders" | "shop" | "workshop" | "legacy";

export function App() {
  const store = useGameStore();
  const [activeTab, setActiveTab] = useState<ActiveTab>("forge");
  const pendingFeedback = getPendingFeedbackEvent(store.state);

  return (
    <main className="app-shell">
      <nav className="main-tabs" aria-label="Game tabs">
        <TabButton activeTab={activeTab} tab="forge" onSelect={setActiveTab} label="Forge" />
        <TabButton activeTab={activeTab} tab="orders" onSelect={setActiveTab} label="Orders" />
        <TabButton activeTab={activeTab} tab="shop" onSelect={setActiveTab} label="Shop" />
        <TabButton
          activeTab={activeTab}
          tab="workshop"
          onSelect={setActiveTab}
          label="Workshop"
        />
        <TabButton activeTab={activeTab} tab="legacy" onSelect={setActiveTab} label="Legacy" />
      </nav>
      {activeTab === "forge" ? <ForgeTab store={store} /> : null}
      {activeTab === "orders" ? <OrdersTab store={store} /> : null}
      {activeTab === "shop" ? <ShopTab store={store} /> : null}
      {activeTab === "workshop" ? <WorkshopTab store={store} /> : null}
      {activeTab === "legacy" ? <PrestigeTab store={store} /> : null}
      {pendingFeedback ? (
        <FeedbackDialog event={pendingFeedback} onClose={store.actions.dismissFeedback} />
      ) : null}
    </main>
  );
}

function TabButton({
  activeTab,
  tab,
  onSelect,
  label
}: {
  activeTab: ActiveTab;
  tab: ActiveTab;
  onSelect: (tab: ActiveTab) => void;
  label: string;
}) {
  return (
    <button
      className={activeTab === tab ? "tab-button active" : "tab-button"}
      type="button"
      onClick={() => onSelect(tab)}
    >
      {label}
    </button>
  );
}
