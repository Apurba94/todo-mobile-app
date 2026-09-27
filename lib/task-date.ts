export function dateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDaysKey(days: number, from = new Date()) {
  const next = new Date(from);
  next.setHours(12, 0, 0, 0);
  next.setDate(next.getDate() + days);
  return dateKey(next);
}

export function dateFromKey(value: string) {
  return new Date(`${value}T12:00:00`);
}

export function formatTaskDate(value?: string) {
  if (!value) return "Unscheduled";
  if (value === dateKey()) return "Today";
  if (value === addDaysKey(1)) return "Tomorrow";
  const date = dateFromKey(value);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatWeekday(value: string) {
  return dateFromKey(value).toLocaleDateString(undefined, { weekday: "short" });
}

export function formatDayNumber(value: string) {
  return dateFromKey(value).toLocaleDateString(undefined, { day: "numeric" });
}

export function formatDateHeading(value = dateKey()) {
  return dateFromKey(value).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
