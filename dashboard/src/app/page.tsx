"use client";

import Header from "@/components/Header";
import WarrantyAlert from "@/components/WarrantyAlert";
import Leaderboard from "@/components/Leaderboard";
import SalesChart from "@/components/SalesChart";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function Dashboard() {
  const { leaderboard, closestWarranty, chartData, connectionStatus } = useDashboardData();

  return (
    <main className="p-8 max-w-7xl mx-auto font-sans text-slate-800 bg-slate-50 min-h-screen">
      <Header status={connectionStatus} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Leaderboard data={leaderboard} />
        <WarrantyAlert warranty={closestWarranty} />
      </div>

      <SalesChart data={chartData} />
    </main>
  );
}