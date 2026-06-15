"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

// --- COMMON TYPES ---
export interface ChartDataItem {
  label: string;
  value: number;
}

// ==========================================
// BAR CHART (SVG based, glowing bars)
// ==========================================
interface BarChartProps {
  readonly data: ChartDataItem[];
  readonly height?: number;
  readonly color?: string;
}

export function BarChart({ data, height = 200, color = "#3B82F6" }: BarChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map(d => d.value), 10);
  const width = 500;
  const paddingX = 40;
  const paddingY = 20;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const barCount = data.length;
  const totalGap = chartWidth * 0.4; // 40% spacing
  const barWidth = (chartWidth - totalGap) / barCount;
  const gap = totalGap / (barCount - 1 || 1);

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none" role="img" aria-label="Bar chart showing emissions data">
        {/* Horizontal gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((r) => {
          const y = paddingY + chartHeight * r;
          const gridVal = Math.round(maxVal * (1 - r));
          return (
            <g key={`bar-grid-${r}`} className="opacity-15">
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="#6B7280"
                strokeWidth="0.5"
              />
              <text
                x={paddingX - 10}
                y={y + 3}
                fill="#9CA3AF"
                fontSize="9"
                textAnchor="end"
                className="font-mono"
              >
                {gridVal}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const x = paddingX + i * (barWidth + gap);
          const barH = (d.value / maxVal) * chartHeight;
          const y = height - paddingY - barH;
          const isHovered = hoveredIdx === i;

          return (
            <g key={`bar-${d.label}`}>
              {/* Actual data bar */}
              <motion.rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barH, 2)}
                rx="4"
                fill={isHovered ? color : `${color}cc`}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                style={{ originY: 1 }}
                transition={{ duration: 0.8, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer transition-all"
              />

              {/* Glowing shadow on hover */}
              {isHovered && (
                <rect
                  x={x - 2}
                  y={y - 2}
                  width={barWidth + 4}
                  height={barH + 4}
                  rx="6"
                  fill={color}
                  opacity="0.15"
                  className="pointer-events-none blur-sm"
                />
              )}

              {/* Label */}
              <text
                x={x + barWidth / 2}
                y={height - paddingY + 15}
                fill="#6B7280"
                fontSize="9"
                textAnchor="middle"
                className="font-medium"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip Overlay */}
      {hoveredIdx !== null && (
        <div
          className="absolute z-20 bg-zinc-950/90 border border-white/10 rounded-xl px-3 py-1.5 shadow-xl text-[11px] backdrop-blur-md font-mono"
          style={{
            left: `${((paddingX + hoveredIdx * (barWidth + gap) + barWidth / 2) / width) * 100}%`,
            top: `${((height - paddingY - (data[hoveredIdx].value / maxVal) * chartHeight) / height) * 100 - 35}%`,
            transform: "translateX(-50%)",
          }}
        >
          <div className="text-zinc-400">{data[hoveredIdx].label}</div>
          <div className="font-bold text-blue-400">{data[hoveredIdx].value} kg CO₂</div>
        </div>
      )}

      {/* Screen Reader Table Fallback */}
      <table className="sr-only">
        <caption>Carbon emissions breakdown</caption>
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col">Emissions (kg CO₂)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={`sr-bar-${d.label}`}>
              <td>{d.label}</td>
              <td>{d.value} kg CO₂</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
