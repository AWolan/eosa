"use client";

import { useEffect, useState, useMemo } from "react";
import { CanPlot, LinePlot, ChartAreaInteractions, TooltipsX, Crosshair } from "@canplot/react";

type LeaderboardEntry = { name: string; total: number };
type Warranty = {
  customerCompany: string;
  expirationDate: string;
  daysLeft: number;
  salesmanName: string;
  warrantyType: string;
};
type ChartPoint = {
  date: string;
  salesman: string;
  cumulativeVolume: number;
  annotation: string;
};

export default function Dashboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [closestWarranty, setClosestWarranty] = useState<Warranty | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [hiddenSalesmen, setHiddenSalesmen] = useState<Set<string>>(new Set());

  // const fetchData = async () => {
  //   try {
  //     const res = await fetch("/api/dashboard");
  //     const data = await res.json();
  //     if (data) {
  //       setLeaderboard(data.leaderboard || []);
  //       setClosestWarranty(data.closestWarranty || null);
  //       setChartData(data.chartData || []);
  //     }
  //   } catch (error) {
  //     console.error("Failed to fetch dashboard data", error);
  //   }
  // };
  //
  // useEffect(() => {
  //   fetchData();
  //   const interval = setInterval(fetchData, 10000);
  //   return () => clearInterval(interval);
  // }, [fetchData]);

  useEffect(() => {
    // Otwieramy stały strumień SSE do naszego nowego endpointu
    const eventSource = new EventSource("/api/dashboard/stream");

    // Gdy serwer wyśle nową paczkę danych, automatycznie aktualizujemy stan UI
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

    eventSource.onerror = (err) => {
      console.error("SSE connection error, attempting reconnect...", err);
    };

    // Sprzątanie po zamknięciu komponentu
    return () => {
      eventSource.close();
    };
  }, []);

  const toggleSalesman = (name: string) => {
    setHiddenSalesmen((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(name)) newSet.delete(name);
      else newSet.add(name);
      return newSet;
    });
  };

  // --- Chart Data Preparation for CanPlot ---
  const chartConfig = useMemo(() => {
    if (chartData.length === 0) return null;

    // Filter out hidden salesmen
    const visibleData = chartData.filter(d => !hiddenSalesmen.has(d.salesman));
    if (visibleData.length === 0) return null;

    // Group data by salesman to create separate lines
    const groupedBySalesman: Record<string, { x: number, y: number, raw: ChartPoint }[]> = {};

    // Find absolute min and max for the scales
    let minTime = Infinity;
    let maxTime = -Infinity;
    let maxVolume = 0;

    visibleData.forEach(point => {
      const timeMs = new Date(point.date).getTime();

      minTime = Math.min(minTime, timeMs);
      maxTime = Math.max(maxTime, timeMs);
      maxVolume = Math.max(maxVolume, point.cumulativeVolume);

      if (!groupedBySalesman[point.salesman]) {
        groupedBySalesman[point.salesman] = [];
      }

      groupedBySalesman[point.salesman].push({
        x: timeMs,
        y: point.cumulativeVolume,
        raw: point // Keep raw data for tooltip
      });
    });

    // If there's only one point in time, add a buffer so the scale doesn't collapse
    if (minTime === maxTime) {
      minTime -= 60000; // 1 minute before
      maxTime += 60000; // 1 minute after
    }

    const scales = [
      {
        id: 'x',
        type: 'time' as const,
        axis: { position: 'bottom' as const, size: 40 },
        origin: 'x' as const,
        min: minTime,
        max: maxTime,
      },
      {
        id: 'y',
        type: 'linear' as const,
        axis: { position: 'left' as const, size: 50 },
        origin: 'y' as const,
        min: 0,
        max: maxVolume * 1.1, // Add 10% padding to the top
      },
    ];

    // Colors for the different lines
    const colors = ['#4c6ef5', '#51cf66', '#ff6b6b', '#fcc419', '#cc5de8'];
    const series = Object.entries(groupedBySalesman).map(([name, data], index) => ({
      name,
      data,
      color: colors[index % colors.length]
    }));

    return { scales, series };
  }, [chartData, hiddenSalesmen]);

  return (
    <main className="p-8 max-w-7xl mx-auto font-sans text-slate-800 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Engine Oil Sales Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Leaderboard Panel */}
        <div className="col-span-2 bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Sales Leaderboard</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
              <tr className="border-b">
                <th className="py-2">Rank</th>
                <th className="py-2">Salesman</th>
                <th className="py-2">Total Volume (Litres)</th>
              </tr>
              </thead>
              <tbody>
              {leaderboard.map((entry, index) => (
                <tr key={entry.name} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="py-3 font-medium">#{index + 1}</td>
                  <td className="py-3">{entry.name}</td>
                  <td className="py-3 font-mono">{entry.total.toFixed(2)} L</td>
                </tr>
              ))}
              {leaderboard.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-slate-500">Waiting for data...</td>
                </tr>
              )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expiring Warranty Alert Panel */}
        <div className="col-span-1 bg-red-50 rounded-xl shadow p-6 border border-red-100 flex flex-col justify-center">
          <h2 className="text-xl font-semibold mb-2 text-red-700">Critical Alert</h2>
          <p className="text-sm text-red-600 font-medium mb-4">Closest Expiring Warranty</p>

          {closestWarranty ? (
            <div>
              <p className="text-3xl font-bold text-red-700 mb-1">
                {closestWarranty.daysLeft} days left
              </p>
              <p className="text-lg font-medium text-slate-800">{closestWarranty.customerCompany}</p>
              <p className="text-sm text-slate-600 mt-2">
                Type: <span className="capitalize">{closestWarranty.warrantyType}</span>
              </p>
              <p className="text-sm text-slate-600">
                Expires: {new Date(closestWarranty.expirationDate).toLocaleDateString()}
              </p>
              <p className="text-sm text-slate-600">Sold by: {closestWarranty.salesmanName}</p>
            </div>
          ) : (
            <p className="text-slate-500">No active warranties found.</p>
          )}
        </div>
      </div>

      {/* Cumulative Chart Panel */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Cumulative Sales Performance</h2>

          <div className="flex gap-2 flex-wrap">
            {leaderboard.map((entry) => {
              const isHidden = hiddenSalesmen.has(entry.name);
              return (
                <button
                  key={entry.name}
                  onClick={() => toggleSalesman(entry.name)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors border ${
                    isHidden
                      ? "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"
                      : "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {entry.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-96 w-full bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100">
          {chartConfig ? (
            <CanPlot
              style={{ width: '100%', height: '100%' }}
              configuration={{
                padding: { bottom: 20, left: 20, right: 20, top: 20 },
                scales: chartConfig.scales,
              }}
            >
              {chartConfig.series.map((series) => (
                <LinePlot
                  key={series.name}
                  data={series.data}
                  xScaleId="x"
                  yScaleId="y"
                  style={{
                    strokeStyle: series.color,
                    lineWidth: 2,
                  }}
                />
              ))}

              <ChartAreaInteractions>
                <Crosshair/>
                <TooltipsX
                  xScaleId="x"
                  data={chartConfig.series.map(s => ({
                    seriesId: s.name,
                    yScaleId: 'y',
                    points: s.data
                  }))}
                  renderTooltip={(state) => {
                    if (!state || state.points.every(p => p.y === null)) return null;

                    const time = new Date(state.x).toLocaleTimeString();
                    return (
                      <div className="bg-slate-800 text-white p-3 rounded shadow-lg text-sm z-50 relative pointer-events-none">
                        <p className="font-bold border-b border-slate-600 pb-1 mb-2">{time}</p>
                        {state.points.map((p, i) => {
                          if (p.y === null) return null;
                          return (
                            <div key={p.seriesId} className="mb-1">
                              <span className="font-medium" style={{ color: chartConfig.series[i].color }}>
                                {p.seriesId}:
                              </span> {p.y.toFixed(1)} L
                              <br/>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }}
                />
              </ChartAreaInteractions>
            </CanPlot>
          ) : (
            <p className="text-slate-400">Waiting for chart data...</p>
          )}
        </div>
      </div>
    </main>
  );
}
