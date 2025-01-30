const DAYS = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

const TIME_SLOTS = [
  { display: "6:00 AM", hour: 6 },
  { display: "7:00 AM", hour: 7 },
  { display: "8:00 AM", hour: 8 },
  { display: "9:00 AM", hour: 9 },
  { display: "10:00 AM", hour: 10 },
  { display: "11:00 AM", hour: 11 },
  { display: "12:00 PM", hour: 12 },
  { display: "1:00 PM", hour: 13 },
  { display: "2:00 PM", hour: 14 },
  { display: "3:00 PM", hour: 15 },
  { display: "4:00 PM", hour: 16 },
  { display: "5:00 PM", hour: 17 },
  { display: "6:00 PM", hour: 18 },
  { display: "7:00 PM", hour: 19 },
  { display: "8:00 PM", hour: 20 },
  { display: "9:00 PM", hour: 21 },
  { display: "10:00 PM", hour: 22 },
  { display: "11:00 PM", hour: 23 },
  { display: "12:00 AM", hour: 0 },
  { display: "1:00 AM", hour: 1 },
  { display: "2:00 AM", hour: 2 },
  { display: "3:00 AM", hour: 3 },
  { display: "4:00 AM", hour: 4 },
  { display: "5:00 AM", hour: 5 },
].map((slot) => ({
  ...slot,
  value: `${String(slot.hour).padStart(2, "0")}:00`,
}));

// Get the start of the week (Monday) for a given date
export function getWeekStart(date) {
  const newDate = new Date(date);
  const day = newDate.getDay();
  const diff = newDate.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(newDate.setDate(diff));
}

// Format day header
export function formatDayHeader(date) {
  return date.toLocaleString("en-US", { weekday: "short" });
}

// Check if a date is today
export function isToday(date) {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

// Generate time slots (6:00 AM to 9:00 PM)
export function generateTimeSlots() {
  const slots = [];
  for (let i = 6; i <= 21; i++) {
    const hour = i % 12 || 12;
    const period = i < 12 ? "AM" : "PM";
    slots.push(`${hour}:00 ${period}`);
  }
  return slots;
}

// Get hour from time slot index
export const getHourFromTimeSlot = (index) => {
  return index + 6; // Simplify since we start at 6 AM
};

// Format time for display
export function formatTime(date) {
  const dateObj = new Date(date);
  const hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

// Add to your existing DateUtils.js
export function formatDateForDB(date) {
  const dateObj = new Date(date);
  return dateObj.toISOString();
}

export function formatDateFromDB(dateString) {
  return new Date(dateString);
}
