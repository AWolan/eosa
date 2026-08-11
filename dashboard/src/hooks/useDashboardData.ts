import { useState, useEffect } from "react";

export function useDashboardData() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [closestWarranty, setClosestWarranty] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'reconnecting' | 'disconnected'>('disconnected');

  useEffect(() => {
    // 1. Initialize the Server-Sent Events stream
    const eventSource = new EventSource("/api/dashboard/stream");

    // 2. Handle connection opened
    eventSource.onopen = () => {
      setConnectionStatus('connected');
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
      setConnectionStatus('reconnecting');
    };

    // 5. Cleanup on unmount
    return () => {
      eventSource.close();
    };
  }, []);

  return { leaderboard, closestWarranty, chartData, connectionStatus };
}
