import { useState } from "react";
import { getPolicies } from "@/lib/storage";
import AlertBanner from "@/components/AlertBanner";
import PolicyManager from "@/components/PolicyManager";
import VehicleManager from "@/components/VehicleManager";
import UserManager from "@/components/UserManager";

type Tab = "policies" | "vehicles" | "users";

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>("policies");
  const policies = getPolicies();

  const tabs: { key: Tab; label: string }[] = [
    { key: "policies", label: "Policies" },
    { key: "vehicles", label: "Vehicles" },
    { key: "users", label: "Users" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AlertBanner policies={policies} />

      {/* Nav */}
      <nav className="border-b border-border bg-card px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">
            Insur<span className="text-accent">Track</span>
          </h1>
          <div className="flex gap-6 text-sm font-medium text-muted-foreground">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`transition-colors hover:text-accent ${
                  activeTab === t.key ? "text-accent font-semibold" : ""
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto p-6 lg:p-10">
        {activeTab === "policies" && <PolicyManager />}
        {activeTab === "vehicles" && <VehicleManager />}
        {activeTab === "users" && <UserManager />}
      </main>
    </div>
  );
};

export default Index;
