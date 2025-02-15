// src/js/utils/eventTransform.js
import {
  formatDateForDB,
  formatDateFromDB,
} from "../modules/calendar/DateUtils.js";

export const transformeventForDB = (data) => ({
  title: data.title,
  date: formatDateForDB(data.date),
  description: data.notes || "",
  priority: data.priority,
  status: data.status || "TODO",
  reminder: data.reminder,
  tags: data.tags ? JSON.stringify(data.tags) : null,
});

export const transformeventFromDB = (event) => ({
  ...event,
  date: formatDateFromDB(event.date),
  notes: event.description,
  tags: event.tags ? JSON.parse(event.tags) : [],
});
