"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

// --- COMMON TYPES ---
export interface ChartDataItem {
  label: string;
  value: number;
}

// ==========================================
// AREA CHART (SVG based, interactive)
// ==========================================
interface AreaChartProps {
  readonly data: ChartDataItem[];
  readonly height?: number;
  readonly color?: string; // hex or tailwind class
  readonly gradientId?: string;
}

export function AreaChart({
  data,
  height = 200,
  color = "#10B981", // Emerald-500
  gradientId = "area-glow-grad"
}: AreaChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map(d => d.value), 10);
  const width = 500;
  const paddingX = 40;
  const paddingY = 20;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Generate SVG path coordinates
  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * chartWidth;
    const y = height - paddingY - (d.value / maxVal) * chartHeight;
    return { x, y, val: d.value, label: d.label };
  });

  const pathD = points.reduce(
    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    ""
  );

  const fillD = `${pathD} L ${points.at(-1)!.x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none" role="img" aria-label="Area chart showing emissions trend over time">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Horizontal gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((r) => {
          const y = paddingY + chartHeight * r;
          const gridVal = Math.round(maxVal * (1 - r));
          return (
            <g key={`grid-${r}`} className="opacity-20">
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="#6B7280"
                strokeWidth="0.5"
                strokeDasharray="4 4"
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

        {/* Shaded Area fill */}
        <motion.path
          d={fillD}
          fill={`url(#${gradientId})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />

        {/* Area Line */}
        <motion.path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />

        {/* Interactivity Dots & Vertical Cursor Line */}
        {points.map((p, idx) => {
          const isHovered = hoveredIdx === idx;
          return (
            <g key={`point-${p.label}`}>
              {/* Trigger area helper */}
              <rect
                x={p.x - chartWidth / (data.length * 2)}
                y={paddingY}
                width={chartWidth / data.length}
                height={chartHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />

              {/* Cursor vertical line */}
              {isHovered && (
                <line
                  x1={p.x}
                  y1={paddingY}
                  x2={p.x}
                  y2={height - paddingY}
                  stroke="#efefef"
                  strokeWidth="0.5"
                  strokeDasharray="2 2"
                  className="pointer-events-none opacity-40"
                />
              )}

              {/* Data circle */}
              <circle
                cx={p.x}
                cy={p.y}
                r={isHovered ? 6 : 3}
                fill={isHovered ? color : "#1F2937"}
                stroke={color}
                strokeWidth={isHovered ? 2 : 1.5}
                className="transition-all duration-150 pointer-events-none"
              />
            </g>
          );
        })}

        {/* Bottom Labels */}
        {points.map((p, idx) => {
          // Show every 2nd or 3rd label depending on data length to prevent overlap
          const showLabel = data.length <= 7 || idx % Math.round(data.length / 5) === 0;
          if (!showLabel) return null;

          return (
            <text
              key={`label-${p.label}`}
              x={p.x}
              y={height - paddingY + 15}
              fill="#6B7280"
              fontSize="9"
              textAnchor="middle"
              className="font-medium"
            >
              {p.label}
            </text>
          );
        })}
      </svg>

      {/* Tooltip Overlay */}
      {hoveredIdx !== null && (
        <div
          className="absolute z-20 bg-zinc-950/90 border border-white/10 rounded-xl px-3 py-1.5 shadow-xl text-[11px] backdrop-blur-md font-mono"
          style={{
            left: `${(points[hoveredIdx].x / width) * 100}%`,
            top: `${(points[hoveredIdx].y / height) * 100 - 35}%`,
            transform: "translateX(-50%)",
          }}
        >
          <div className="text-zinc-400">{points[hoveredIdx].label}</div>
          <div className="font-bold text-emerald-400">{points[hoveredIdx].val} kg CO₂</div>
        </div>
      )}

      {/* Screen Reader Table Fallback */}
      <table className="sr-only">
        <caption>Emissions trend over time</caption>
        <thead>
          <tr>
            <th scope="col">Time Period / Date</th>
            <th scope="col">Emissions (kg CO₂)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={`sr-area-${d.label}`}>
              <td>{d.label}</td>
              <td>{d.value} kg CO₂</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
