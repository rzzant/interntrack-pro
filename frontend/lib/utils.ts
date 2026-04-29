/**
 * Utility Functions
 */

import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Format date to readable string */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Get days since a date */
export function daysSince(dateString: string): number {
  const date = new Date(dateString);
  const now = new Date();
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

/** Status color mapping */
export const STATUS_COLORS = {
  Applied: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
    dot: "bg-blue-400",
    hex: "#3b82f6",
    light: "rgba(59, 130, 246, 0.15)",
  },
  Interview: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
    dot: "bg-amber-400",
    hex: "#f59e0b",
    light: "rgba(245, 158, 11, 0.15)",
  },
  Offer: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    dot: "bg-emerald-400",
    hex: "#10b981",
    light: "rgba(16, 185, 129, 0.15)",
  },
  Rejected: {
    bg: "bg-gray-500/10",
    text: "text-gray-400",
    border: "border-gray-500/20",
    dot: "bg-gray-400",
    hex: "#6b7280",
    light: "rgba(107, 114, 128, 0.15)",
  },
} as const;

/** Get initials from company name */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
}

/** Generate a consistent color from string */
export function stringToColor(str: string): string {
  const colors = [
    "#3b82f6", "#8b5cf6", "#ec4899", "#f97316",
    "#10b981", "#06b6d4", "#84cc16", "#eab308",
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
