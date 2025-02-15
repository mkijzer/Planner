// Helper function to format date according to the system locale
export function formatDate(date) {
  const userLocale = navigator.language || "en-US"; // Use system locale

  const options = { year: "numeric", month: "long", day: "numeric" };
  const formattedDate = new Date(date).toLocaleDateString(userLocale, options);
  const weekday = new Date(date).toLocaleDateString(userLocale, {
    weekday: "long",
  });

  return `${formattedDate} (${weekday})`;
}

/*
  Original code (for fallback):
  
  const DAYS = {
    0: new Date(2024, 0, 7).toLocaleString(undefined, { weekday: "short" }), // Auto-detect system locale
    1: new Date(2024, 0, 1).toLocaleString(undefined, { weekday: "short" }),
    2: new Date(2024, 0, 2).toLocaleString(undefined, { weekday: "short" }),
    3: new Date(2024, 0, 3).toLocaleString(undefined, { weekday: "short" }),
    4: new Date(2024, 0, 4).toLocaleString(undefined, { weekday: "short" }),
    5: new Date(2024, 0, 5).toLocaleString(undefined, { weekday: "short" }),
    6: new Date(2024, 0, 6).toLocaleString(undefined, { weekday: "short" }),
  };
*/

// Refactored DAYS object using `formatDate`:
export const DAYS = {
  0: formatDate(new Date(2024, 0, 7)),
  1: formatDate(new Date(2024, 0, 1)),
  2: formatDate(new Date(2024, 0, 2)),
  3: formatDate(new Date(2024, 0, 3)),
  4: formatDate(new Date(2024, 0, 4)),
  5: formatDate(new Date(2024, 0, 5)),
  6: formatDate(new Date(2024, 0, 6)),
};

/*
  Original code (for fallback):
  
  const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
    const time = new Date(2024, 0, 1, i); // Example date with hour `i`
    return {
      display: time.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      }), // Auto-detect 12h or 24h format based on locale
      hour: i,
      value: `${String(i).padStart(2, "0")}:00`,
    };
  });
*/

// Refactored TIME_SLOTS using locale-aware formatting:
export const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const time = new Date(2024, 0, 1, i); // Example date with hour `i`
  return {
    display: time.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }), // Auto-detect 12h or 24h format based on locale
    hour: i,
    value: `${String(i).padStart(2, "0")}:00`,
  };
});

// Function to get the start of the week based on a given date
export function getWeekStart(date) {
  const newDate = new Date(date);
  const day = newDate.getDay();
  const diff = newDate.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(newDate.setDate(diff));
}

/*
  Original code (for fallback):
  
  export function formatDayHeader(date) {
    return date.toLocaleString(undefined, { weekday: "short" }); // Use system locale
  }
*/

// Refactored formatDayHeader to use `formatDate`
export function formatDayHeader(date) {
  return formatDate(date); // Use formatDate to get the full formatted string
}

// Function to check if the given date is today
export function isToday(date) {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

// Function to generate time slots for a specific range, based on the locale settings
export function generateTimeSlots() {
  const slots = [];

  // Part 1: Evening hours (6:00 - 23:00)
  for (let i = 6; i <= 23; i++) {
    const time = new Date(2024, 0, 1, i);
    slots.push(
      time.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    );
  }
  // This loop creates slots for 6:00, 7:00... up to 23:00
  // Total: 18 slots

  // Part 2: Early morning hours (00:00 - 05:00)
  for (let i = 0; i <= 5; i++) {
    const time = new Date(2024, 0, 2, i); // Using next day
    slots.push(
      time.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    );
  }
  // This loop adds slots for 00:00, 1:00... up to 5:00
  // Total: 6 slots

  return slots;
}

export const getHourFromTimeSlot = (index) => {
  if (index <= 17) {
    // First 18 slots (6-23)
    return index + 6; // Convert 0->6, 1->7, etc.
  } else {
    // Last 6 slots (0-5)
    return index - 18; // Convert 18->0, 19->1, etc.
  }
};
/*
  Original code (for fallback):
  
  // Fix formatTime to use locale-aware formatting instead of hardcoded AM/PM
  export function formatTime(date) {
    return new Date(date).toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  }
*/

// Refactored formatTime to use locale-aware formatting
export function formatTime(date) {
  return new Date(date).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

// Function to format the date for the database (ISO format)
export function formatDateForDB(date) {
  const dateObj = new Date(date);
  return dateObj.toISOString(); // Standardized format for DB
}

// Function to parse a date string from the database back into a Date object
export function formatDateFromDB(dateString) {
  return new Date(dateString); // Parse the DB date string back to a Date object
}
