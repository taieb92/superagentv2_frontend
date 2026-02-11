import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Start of current month (1st at 00:00:00) as Unix timestamp. */
export function getStartOfThisMonth(): number {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Returns the item with the latest date, or null if array is empty. */
export function mostRecentBy<T>(
  items: T[],
  getDateIso: (item: T) => string
): T | null {
  if (items.length === 0) return null;
  const sorted = [...items].sort(
    (a, b) =>
      new Date(getDateIso(b)).getTime() - new Date(getDateIso(a)).getTime()
  );
  return sorted[0] ?? null;
}
