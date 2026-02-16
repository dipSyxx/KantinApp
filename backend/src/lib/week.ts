import { addDays, getISOWeek, getISOWeekYear, startOfISOWeek } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

const TIMEZONE = 'Europe/Oslo'

/**
 * Get the current date in Oslo timezone
 */
export function nowOslo(): Date {
  return toZonedTime(new Date(), TIMEZONE)
}

/**
 * Get current ISO week number in Oslo timezone
 */
export function currentISOWeek(): { year: number; week: number } {
  const now = nowOslo()
  return {
    year: getISOWeekYear(now),
    week: getISOWeek(now),
  }
}

/**
 * Get Monday–Friday dates for a given ISO week.
 * Returns dates at UTC noon to avoid timezone shifts when stored as @db.Date.
 */
export function weekDates(year: number, week: number): Date[] {
  // Construct a date that falls in the desired ISO week
  // Jan 4 is always in ISO week 1
  const jan4 = new Date(year, 0, 4)
  const startOfWeek1 = startOfISOWeek(jan4)
  const monday = addDays(startOfWeek1, (week - 1) * 7)

  return Array.from({ length: 5 }, (_, i) => {
    const d = addDays(monday, i)
    // UTC noon so that ±12 h timezone never shifts the calendar date
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0))
  })
}

/**
 * Check if a date is today (Oslo timezone)
 */
export function isToday(date: Date): boolean {
  const now = nowOslo()
  return (
    date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate()
  )
}

/**
 * Check if a date is in the past (Oslo timezone, end of day)
 */
export function isDayPast(date: Date): boolean {
  const now = nowOslo()
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)
  return endOfDay < now
}

/**
 * Norwegian day names
 */
export const DAY_NAMES = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag']
