"use client";

import React from "react";
import { Search } from "lucide-react";

export interface CategoryTabsProps {
  selectedCategory: string;
  searchTerm: string;
  onCategoryChange: (cat: string) => void;
  onSearchChange: (term: string) => void;
}

const CATEGORIES = ["all", "transport", "food", "electricity", "shopping"];

export function CategoryTabs({
  selectedCategory,
  searchTerm,
  onCategoryChange,
  onSearchChange,
}: CategoryTabsProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
      {/* Category Tabs */}
      <div className="flex gap-1.5 p-1 bg-zinc-950 border border-white/[0.06] rounded-xl overflow-x-auto w-full md:w-auto" role="tablist">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            role="tab"
            aria-selected={selectedCategory === cat}
            onClick={() => onCategoryChange(cat)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              selectedCategory === cat
                ? "bg-white/5 border border-white/[0.08] text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative w-full md:w-64">
        <span className="absolute left-3.5 top-3 text-zinc-500">
          <Search className="h-4 w-4" aria-hidden="true" />
        </span>
        <label htmlFor="search-activities" className="sr-only">Search activities</label>
        <input
          id="search-activities"
          type="text"
          placeholder="Search activities..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-zinc-950/60 border border-white/[0.08] rounded-xl py-2.5 pl-10 pr-4 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/40 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-all font-mono"
        />
      </div>
    </div>
  );
}
