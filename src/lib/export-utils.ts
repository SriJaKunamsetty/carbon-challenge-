import type { Activity } from "@/types";

/**
 * Normalises a date value into an ISO date string format.
 */
function formatDate(value: unknown): string {
  if (value && typeof value === "object" && "toDate" in value && typeof (value as { toDate: unknown }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate().toISOString().split("T")[0];
  }
  if (value instanceof Date) {
    return value.toISOString().split("T")[0];
  }
  if (typeof value === "string" || typeof value === "number") {
    return new Date(value).toISOString().split("T")[0];
  }
  return new Date().toISOString().split("T")[0];
}

/**
 * Escapes a field string value for safe usage in CSV formatting.
 *
 * @param value - Raw text value to escape
 * @returns Escaped CSV-compliant string value
 */
function escapeCsv(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Formats a list of activities as a CSV string and triggers a browser file download.
 *
 * @param activities - The user's list of logged activities to export
 */
export function exportToCsv(activities: Activity[]): void {
  if (typeof window === "undefined" || !activities || activities.length === 0) {
    return;
  }

  const headers = ["ID", "Category", "Type", "Value", "Unit", "Carbon (kg CO2)", "Date", "Note"];

  const rows = activities.map((act: Activity) => [
    act.id,
    act.category,
    act.type ?? "unknown",
    act.value,
    act.unit,
    act.carbonEmit ?? 0,
    formatDate(act.date),
    act.note ? escapeCsv(act.note) : "",
  ]);

  const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `carbonmind_activities_${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
