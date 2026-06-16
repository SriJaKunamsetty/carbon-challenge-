"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle } from "lucide-react";
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, orderBy, limit, startAfter } from "firebase/firestore";
import type { QueryDocumentSnapshot, DocumentData, QueryConstraint } from "firebase/firestore";
import { db } from "@/lib/firebase";
import confetti from "canvas-confetti";
import { logger } from "@/lib/logger";

import { AddActivityModal } from "@/components/tracker/add-activity-modal";
import { ActivityCard, type LogEntry } from "@/components/tracker/activity-card";
import { CategoryTabs } from "@/components/tracker/category-tabs";

const LOG_CTX = { module: "CarbonTrackerPage" };

function getCategoryLabel(category: string, note?: string) {
  if (note) return note;
  switch (category) {
    case "transport": return "Commute";
    case "food": return "Diet serving";
    case "electricity": return "Appliance run";
    case "shopping": return "Purchase item";
    default: return "Activity";
  }
}

function processFetchedDocs(docs: QueryDocumentSnapshot<DocumentData>[]) {
  const fetched: LogEntry[] = [];
  docs.forEach((docSnap) => {
    const data = docSnap.data();
    let dateStr = "";
    if (data.date) {
      if (data.date.seconds) {
        dateStr = new Date(data.date.seconds * 1000).toISOString().split("T")[0];
      } else if (data.date instanceof Date) {
        dateStr = data.date.toISOString().split("T")[0];
      } else {
        dateStr = new Date(data.date).toISOString().split("T")[0];
      }
    }
    fetched.push({
      id: docSnap.id,
      category: data.category,
      label: getCategoryLabel(data.category, data.note),
      value: data.value,
      unit: data.unit,
      carbon: data.carbonEmit || 0,
      date: dateStr,
      note: data.note,
    });
  });
  return fetched;
}

function buildActivitiesQuery(userId: string, category: string, limitVal: number, lastVisibleDoc: unknown) {
  const constraints: unknown[] = [where("userId", "==", userId)];
  if (category !== "all") constraints.push(where("category", "==", category));
  constraints.push(orderBy("date", "desc"));
  if (lastVisibleDoc) constraints.push(startAfter(lastVisibleDoc));
  constraints.push(limit(limitVal));
  return query(collection(db, "activities"), ...(constraints as QueryConstraint[]));
}

export default function CarbonTrackerPage() {
  const { profile } = useAuth();
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const itemsPerPage = 6;
  const [showAddModal, setShowAddModal] = useState(false);
  const [addCategory, setAddCategory] = useState<"transport" | "food" | "electricity" | "shopping">("transport");
  const [addValue, setAddValue] = useState<number>(10);
  const [addType, setAddType] = useState<string>("");
  const [addNote, setAddNote] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const fetchEntries = async (isLoadMore = false) => {
    if (!profile) return;
    if (!isLoadMore) setLoading(true);
    try {
      const q = buildActivitiesQuery(profile.uid, selectedCategory, itemsPerPage + 1, isLoadMore ? lastVisible : null);
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs;
      const newHasMore = docs.length > itemsPerPage;
      const docsToProcess = newHasMore ? docs.slice(0, itemsPerPage) : docs;
      const lastDoc = docsToProcess[docsToProcess.length - 1];
      setLastVisible(lastDoc || null);
      setHasMore(newHasMore);
      const fetched = processFetchedDocs(docsToProcess);
      if (isLoadMore) { setEntries((prev) => [...prev, ...fetched]); } else { setEntries(fetched); }
    } catch (error) {
      logger.error(LOG_CTX, "Failed to fetch activities", error);
      if (!isLoadMore) setEntries([]);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    let active = true;
    const doFetch = async () => {
      if (!profile) return;
      setLoading(true);
      try {
        const q = buildActivitiesQuery(profile.uid, selectedCategory, itemsPerPage + 1, null);
        const querySnapshot = await getDocs(q);
        const docs = querySnapshot.docs;
        const newHasMore = docs.length > itemsPerPage;
        const docsToProcess = newHasMore ? docs.slice(0, itemsPerPage) : docs;
        const lastDoc = docsToProcess[docsToProcess.length - 1];
        if (active) { setLastVisible(lastDoc || null); setHasMore(newHasMore); }
        const fetched = processFetchedDocs(docsToProcess);
        if (active) setEntries(fetched);
      } catch (error) {
        logger.error(LOG_CTX, "Failed to fetch activities", error);
        if (active) setEntries([]);
      } finally { if (active) setLoading(false); }
    };
    doFetch();
    return () => { active = false; };
  }, [profile, selectedCategory]);

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSubmitting(true);
    const unitMap: Record<string, string> = { transport: "km", food: "servings", electricity: "hours", shopping: "items" };
    const unit = unitMap[addCategory] || "units";
    const newLogLabel = addNote || `${addCategory.charAt(0).toUpperCase() + addCategory.slice(1)} manual log`;
    const defaultTypeMap: Record<string, string> = { transport: "gasolineCar", food: "poultry", electricity: "airConditioner" };
    const resolvedType = addType || defaultTypeMap[addCategory] || "misc";
    try {
      const docRef = await addDoc(collection(db, "activities"), {
        userId: profile.uid, category: addCategory, type: resolvedType, value: addValue, unit, date: new Date(), note: newLogLabel,
      });
      setEntries(prev => [{ id: docRef.id, category: addCategory, label: newLogLabel, value: addValue, unit, carbon: 0, date: new Date().toISOString().split("T")[0], note: addNote }, ...prev]);
      confetti({ particleCount: 40, angle: 60, spread: 55, origin: { x: 0 }, colors: ["#10B981", "#3B82F6", "#F59E0B"] });
      setShowAddModal(false); setAddNote(""); setAddValue(10); setAddType("");
    } catch (err) { logger.error(LOG_CTX, "Failed to add entry", err); } finally { setSubmitting(false); }
  };

  const handleDeleteEntry = async (id: string) => {
    try { await deleteDoc(doc(db, "activities", id)); setEntries(prev => prev.filter(e => e.id !== id)); }
    catch (err) { logger.error(LOG_CTX, "Failed to delete entry", err); }
  };

  const filtered = entries.filter((e) => {
    const matchesSearch = e.label.toLowerCase().includes(searchTerm.toLowerCase()) || e.note?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  let trackerContent;
  if (loading) {
    trackerContent = (
      <li className="col-span-2 text-center py-20" aria-busy="true" aria-label="Loading activities">
        <div className="w-6 h-6 border-2 border-t-emerald-400 border-r-transparent border-b-transparent border-l-transparent animate-spin rounded-full mx-auto" />
      </li>
    );
  } else if (filtered.length === 0) {
    trackerContent = (
      <li className="col-span-2">
        <GlassCard className="py-16 text-center" role="alert">
          <AlertCircle className="h-8 w-8 text-zinc-600 mx-auto mb-4" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-zinc-300">No logs found</h2>
          <p className="text-xs text-zinc-500 mt-1">Try resetting filters or log a new activity.</p>
        </GlassCard>
      </li>
    );
  } else {
    trackerContent = filtered.map((item) => (
      <li key={item.id}><ActivityCard item={item} onDelete={handleDeleteEntry} /></li>
    ));
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-display">Carbon Tracker</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Log, track, and monitor individual carbon contributors in real-time.</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" aria-hidden="true" /><span>Add Activity</span>
        </Button>
      </div>

      <CategoryTabs selectedCategory={selectedCategory} searchTerm={searchTerm}
        onCategoryChange={setSelectedCategory} onSearchChange={setSearchTerm} />

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">{trackerContent}</ul>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button onClick={() => fetchEntries(true)} variant="secondary" className="flex items-center gap-2"><span>Load More</span></Button>
        </div>
      )}

      {showAddModal && (
        <AddActivityModal addCategory={addCategory} addValue={addValue} addType={addType} addNote={addNote} submitting={submitting}
          onCategoryChange={setAddCategory} onValueChange={setAddValue} onTypeChange={setAddType} onNoteChange={setAddNote}
          onClose={() => setShowAddModal(false)} onSubmit={handleAddEntry} />
      )}
    </div>
  );
}
