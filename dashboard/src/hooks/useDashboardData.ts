import {useEffect, useState} from "react";
import {ChartDataPoint, ConnectionStatus, LeaderboardEntry, Warranty} from "@/common/common.types";

export type UseDashboardDataResult = {
  leaderboard: LeaderboardEntry[];
  closestWarranty: Warranty | null;
  chartData: ChartDataPoint[];
  connectionStatus: ConnectionStatus;
}

export function useDashboardData(): UseDashboardDataResult {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [closestWarranty, setClosestWarranty] = useState<Warranty | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.Disconnected);

  useEffect(() => {
    // 1. Initialize the Server-Sent Events stream
    const eventSource = new EventSource("/api/dashboard/stream");

    // 2. Handle connection opened
    eventSource.onopen = () => {
      setConnectionStatus(ConnectionStatus.Connected);
    };

    // 3. Handle incoming data payloads
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLeaderboard(data.leaderboard || []);
        setClosestWarranty(data.closestWarranty || null);
        setChartData(data.chartData || []);
      } catch (err) {
        console.error("Failed to parse SSE data", err);
      }
    };

    // 4. Handle connection drops / reconnections
    eventSource.onerror = () => {
      setConnectionStatus(ConnectionStatus.Reconnecting);
    };

    // 5. Cleanup on unmount
    return () => {
      eventSource.close();
    };
  }, []);

  return { leaderboard, closestWarranty, chartData, connectionStatus };
}
