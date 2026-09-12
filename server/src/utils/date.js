/**
 * Date utility functions for server.
 * Returns local-time date strings (YYYY-MM-DD) consistently.
 */

export function getTodayDate() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentMonth() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getPrevMonth(monthStr) {
  const [y, m] = monthStr.split('-').map(Number);
  const date = new Date(y, m - 2, 1); // m-2 because months are 0-indexed
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getDaysInMonth(monthStr) {
  const [y, m] = monthStr.split('-').map(Number);
  return new Date(y, m, 0).getDate();
}

export function getElapsedDaysInMonth(monthStr) {
  const today = getTodayDate();
  const [ty, tm, td] = today.split('-').map(Number);
  const [my, mm] = monthStr.split('-').map(Number);
  const daysInMonth = getDaysInMonth(monthStr);

  if (ty === my && tm === mm) {
    // Current month: only count up to today
    return Math.min(td, daysInMonth);
  }

  // Past month: all days elapsed
  const monthEnd = new Date(my, mm, 0); // last day of that month
  const todayDate = new Date(ty, tm - 1, td);
  if (todayDate > monthEnd) {
    return daysInMonth;
  }
  // Future month: 0 days elapsed
  return 0;
}

export function shiftDateStr(dateStr, offsetDays) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d + offsetDays);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}


