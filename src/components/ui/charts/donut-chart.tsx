"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

// --- COMMON TYPES ---
export interface DonutDataItem {
  name: string;
  value: number;
  color: string;
}

// ==========================================
// DONUT CHART (SVG arcs)
// ==========================================
interface DonutChartProps {
  readonly data: DonutDataItem[];
  readonly size?: number;
}

export function DonutChart({ data, size = 180 }: DonutChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const total = data.reduce((acc, d) => acc + d.value, 0) || 1;
  const radius = 80;
  const center = size / 2;

  const arcs = data.reduce<{
    arcs: Array<{
      path: string;
      color: string;
      name: string;
      value: number;
      percentage: number;
    }>;
    accumulatedAngle: number;
  }>(
    (acc, d) => {
      const percentage = d.value / total;
      const angle = percentage * 360;

      const startAngle = acc.accumulatedAngle;
      const endAngle = acc.accumulatedAngle + angle;

      const polarToCartesian = (centerX: number, centerY: number, r: number, angleInDegrees: number) => {
      const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
      return {
        x: centerX + r * Math.cos(angleInRadians),
        y: centerY + r * Math.sin(angleInRadians),
      };
    };

    const start = polarToCartesian(center, center, radius, startAngle);
    const end = polarToCartesian(center, center, radius, endAngle);
    const largeArcFlag = angle <= 180 ? "0" : "1";

    const pathData = [
      "M", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 1, end.x, end.y
    ].join(" ");

    acc.arcs.push({
      path: pathData,
      color: d.color,
      name: d.name,
      value: d.value,
      percentage: Math.round(percentage * 100),
    });
    
    acc.accumulatedAngle = endAngle;
    return acc;
  }, { arcs: [], accumulatedAngle: 0 }).arcs;

  const activeArc = hoveredIdx === null ? null : arcs[hoveredIdx];

  return (
    <div className="flex flex-col sm:flex-row items-center gap-8 justify-center p-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="overflow-visible select-none" role="img" aria-label="Donut chart showing breakdown of emissions by category">
          {/* Inner cutout mask effect */}
          {arcs.map((arc, idx) => {
            const isHovered = hoveredIdx === idx;
            const strokeW = isHovered ? 20 : 14;
            return (
              <motion.path
                key={`arc-${arc.name}`}
                d={arc.path}
                fill="none"
                stroke={arc.color}
                strokeWidth={strokeW}
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{ strokeLinecap: "round" }}
              />
            );
          })}
        </svg>

        {/* Center overlay details */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {activeArc ? (
            <>
              <span className="text-xl font-bold font-mono text-white">
                {activeArc.percentage}%
              </span>
              <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold max-w-[80px] text-center truncate">
                {activeArc.name}
              </span>
            </>
          ) : (
            <>
              <span className="text-lg font-bold font-mono text-white">
                {Math.round(total)}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">
                Total kg
              </span>
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2">
        {arcs.map((arc, idx) => {
          const isHovered = hoveredIdx === idx;
          return (
            <button
              key={`legend-${arc.name}`}
              type="button"
              className={`flex items-center gap-3 px-3 py-1.5 rounded-lg border transition-all duration-200 cursor-pointer text-left w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 focus-visible:ring-offset-black ${
                isHovered
                  ? "bg-white/5 border-white/10"
                  : "bg-transparent border-transparent"
              }`}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              onFocus={() => setHoveredIdx(idx)}
              onBlur={() => setHoveredIdx(null)}
              aria-label={`${arc.name}: ${Math.round(arc.value)} kg CO₂ (${arc.percentage}%)`}
            >
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: arc.color }}
              />
              <div className="text-xs">
                <span className="text-zinc-300 font-medium">{arc.name}</span>
                <span className="text-zinc-500 ml-2 font-mono">
                  {Math.round(arc.value)} kg ({arc.percentage}%)
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Screen Reader Table Fallback */}
      <table className="sr-only">
        <caption>Breakdown of emissions by category</caption>
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col">Emissions (kg CO₂)</th>
            <th scope="col">Percentage</th>
          </tr>
        </thead>
        <tbody>
          {arcs.map((arc) => (
            <tr key={`sr-donut-${arc.name}`}>
              <td>{arc.name}</td>
              <td>{Math.round(arc.value)} kg CO₂</td>
              <td>{arc.percentage}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
