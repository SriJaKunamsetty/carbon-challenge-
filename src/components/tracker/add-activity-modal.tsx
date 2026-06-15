"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export type ActivityCategory = "transport" | "food" | "electricity" | "shopping";

export interface AddActivityModalProps {
  addCategory: ActivityCategory;
  addValue: number;
  addType: string;
  addNote: string;
  submitting: boolean;
  onCategoryChange: (cat: ActivityCategory) => void;
  onValueChange: (v: number) => void;
  onTypeChange: (v: string) => void;
  onNoteChange: (v: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function AddActivityModal({
  addCategory,
  addValue,
  addType,
  addNote,
  submitting,
  onCategoryChange,
  onValueChange,
  onTypeChange,
  onNoteChange,
  onClose,
  onSubmit,
}: AddActivityModalProps) {
  return (
    <dialog className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm" open aria-modal="true" aria-labelledby="modal-title">
      <div className="w-full max-w-md bg-zinc-950 border border-white/[0.08] rounded-2xl p-6 relative shadow-2xl animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-500 hover:text-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg p-1"
          aria-label="Close modal"
        >
          <X className="h-4.5 w-4.5" aria-hidden="true" />
        </button>

        <h2 id="modal-title" className="text-base font-bold text-zinc-100 mb-6">Log Carbon Activity</h2>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Category</span>
            <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Select category">
              {(["transport", "food", "electricity", "shopping"] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  role="radio"
                  aria-checked={addCategory === cat}
                  onClick={() => {
                    onCategoryChange(cat);
                    onTypeChange(""); // reset type
                  }}
                  className={`py-2 rounded-xl text-[10px] font-bold uppercase border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                    addCategory === cat
                      ? "bg-white/5 border-white/20 text-white"
                      : "border-transparent bg-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Type Select based on category */}
          <div className="space-y-1">
            <label htmlFor="activity-type" className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Type</label>
            <select
              id="activity-type"
              value={addType}
              onChange={(e) => onTypeChange(e.target.value)}
              className="w-full bg-zinc-900 border border-white/[0.08] rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/40"
              required
            >
              <option value="" disabled>Select Type...</option>
              {addCategory === "transport" && (
                <>
                  <option value="gasolineCar">Gasoline passenger car</option>
                  <option value="electricCar">Electric vehicle (EV)</option>
                  <option value="motorcycle">Motorcycle</option>
                  <option value="bus">City Bus</option>
                  <option value="train">Train / Metro</option>
                </>
              )}
              {addCategory === "food" && (
                <>
                  <option value="beef">Beef serving</option>
                  <option value="poultry">Poultry (chicken, turkey)</option>
                  <option value="pork">Pork serving</option>
                  <option value="fish">Seafood / Fish</option>
                  <option value="dairy">Dairy &amp; Eggs</option>
                  <option value="vegetables">Plant-based meal</option>
                </>
              )}
              {addCategory === "electricity" && (
                <>
                  <option value="airConditioner">Air Conditioner</option>
                  <option value="heater">Space Heater</option>
                  <option value="television">Television</option>
                  <option value="computer">Computer / PC</option>
                </>
              )}
              {addCategory === "shopping" && (
                <>
                  <option value="clothing">Clothing item</option>
                  <option value="electronics">Electronics</option>
                  <option value="furniture">Furniture</option>
                  <option value="misc">Miscellaneous</option>
                </>
              )}
            </select>
          </div>

          {/* Dynamic Value Input */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label htmlFor="activity-value" className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Volume / Amount</label>
              <span className="text-[10px] text-emerald-400 font-mono font-bold" aria-live="polite">
                {addCategory === "transport" && "km"}
                {addCategory === "food" && "servings"}
                {addCategory === "electricity" && "hours"}
                {addCategory === "shopping" && "items"}
              </span>
            </div>
            <input
              id="activity-value"
              type="number"
              min="0.1"
              step="any"
              value={addValue}
              onChange={(e) => onValueChange(Number(e.target.value))}
              className="w-full bg-zinc-900 border border-white/[0.08] rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/40"
              required
            />
          </div>

          {/* Note */}
          <div className="space-y-1">
            <label htmlFor="activity-note" className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Description / Note</label>
            <input
              id="activity-note"
              type="text"
              placeholder="e.g. 'Commute to school', 'Had steak'"
              value={addNote}
              onChange={(e) => onNoteChange(e.target.value)}
              className="w-full bg-zinc-900 border border-white/[0.08] rounded-xl p-3 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/40"
            />
          </div>

          <Button type="submit" className="w-full py-3 mt-4" loading={submitting}>
            Add Entry
          </Button>
        </form>
      </div>
    </dialog>
  );
}
