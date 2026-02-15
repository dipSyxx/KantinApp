/**
 * Get the ISO week number for a given date
 */
export function getISOWeek(date: Date): number {
  const d = new Date(date.getTime());
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7
    )
  );
}

/**
 * Get the ISO week year
 */
export function getISOWeekYear(date: Date): number {
  const d = new Date(date.getTime());
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  return d.getFullYear();
}

/**
 * Get current ISO week info
 */
export function currentWeek(): { year: number; week: number } {
  const now = new Date();
  return {
    year: getISOWeekYear(now),
    week: getISOWeek(now),
  };
}

/**
 * Norwegian day names (short)
 */
export const DAY_NAMES_SHORT = ["Man", "Tir", "Ons", "Tor", "Fre"];
export const DAY_NAMES = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag"];

/**
 * Format a date string (YYYY-MM-DD) to Norwegian day name
 */
export function formatDayName(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const dayIndex = (date.getDay() + 6) % 7; // Monday = 0
  return DAY_NAMES[dayIndex] ?? dateStr;
}

/**
 * Check if a date string is today
 */
export function isToday(dateStr: string): boolean {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  return dateStr === todayStr;
}

/**
 * Format date to "DD. MMM" (e.g. "13. jan")
 */
export function formatShortDate(dateStr: string): string {
  const months = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];
  const date = new Date(dateStr + "T00:00:00");
  return `${date.getDate()}. ${months[date.getMonth()]}`;
}
