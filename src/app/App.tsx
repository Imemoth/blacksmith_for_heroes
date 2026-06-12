import { useState } from "react";
import { ForgeTab } from "../features/forge/ForgeTab";
import { OrdersTab } from "../features/orders/OrdersTab";
import { useGameStore } from "../game/state/gameStore";

export function App() {
  const store = useGameStore();
  const [activeTab, setActiveTab] = useState<"forge" | "orders">("forge");

  return (
    <main className="app-shell">
      <nav className="main-tabs" aria-label="Game tabs">
        <button
          className={activeTab === "forge" ? "tab-button active" : "tab-button"}
          type="button"
          onClick={() => setActiveTab("forge")}
        >
          Forge
        </button>
        <button
          className={activeTab === "orders" ? "tab-button active" : "tab-button"}
          type="button"
          onClick={() => setActiveTab("orders")}
        >
          Orders
        </button>
      </nav>
      {activeTab === "forge" ? <ForgeTab store={store} /> : <OrdersTab store={store} />}
    </main>
  );
}
