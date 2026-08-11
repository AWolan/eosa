"use client";

import { useState, useMemo } from "react";
import {
  CanPlot,
  LinePlot,
  ChartAreaInteractions,
  Crosshair,
  TooltipsX
} from "@canplot/react";

export interface ChartDataPoint {
  date: string;
  salesman: string;
  cumulativeVolume: number;
  annotation?: string;
}

interface SalesChartProps {
  data: ChartDataPoint[];
}

export default function SalesChart({ data }: SalesChartProps) {
  const uniqueSalesmen = useMemo(() => {
    return Array.from(new Set(data.map((d) => d.salesman)));
  }, [data]);

  const [hiddenSalesmen, setHiddenSalesmen] = useState<Set<string>>(new Set());

  const toggleSalesman = (name: string) => {
    setHiddenSalesmen((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(name)) newSet.delete(name);
      else newSet.add(name);
      return newSet;
    });
  };

  const chartConfig = useMemo(() => {
    if (data.length === 0) return null;

    const visibleData = data.filter(d => !hiddenSalesmen.has(d.salesman));
    if (visibleData.length === 0) return null;

    const groupedBySalesman: Record<string, { x: number, y: number }[]> = {};

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
      });
    });

    if (minTime === maxTime) {
      minTime -= 60000;
      maxTime += 60000;
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
        max: maxVolume * 1.1,
      },
    ];

    const colors = ['#4c6ef5', '#51cf66', '#ff6b6b', '#fcc419', '#cc5de8'];
    const series = Object.entries(groupedBySalesman).map(([name, seriesData], index) => ({
      name,
      data: seriesData.sort((a, b) => a.x - b.x),
      color: colors[index % colors.length]
    }));

    return { scales, series };
  }, [data, hiddenSalesmen]);

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Cumulative Sales Performance</h2>

        <div className="flex gap-2 flex-wrap">
          {uniqueSalesmen.map((name) => {
            const isHidden = hiddenSalesmen.has(name);
            return (
              <button
                key={name}
                onClick={() => toggleSalesman(name)}
                className={`px-3 py-1 text-sm rounded-full transition-colors border ${
                  isHidden
                    ? "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"
                    : "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-96 w-full bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 overflow-hidden relative">
        {chartConfig ? (
          <CanPlot
            style={{ width: '100%', height: '100%' }}
            configuration={{
              padding: { bottom: 20, left: 20, right: 20, top: 20 },
              // @ts-ignore
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
              <Crosshair />
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
  );
}
