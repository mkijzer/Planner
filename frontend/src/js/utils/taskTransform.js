// src/js/utils/taskTransform.js
import {
  formatDateForDB,
  formatDateFromDB,
} from "../modules/calendar/DateUtils.js";

export const transformTaskForDB = (data) => ({
  title: data.title,
  date: formatDateForDB(data.date),
  description: data.notes || "",
  priority: data.priority,
  status: data.status || "TODO",
  reminder: data.reminder,
  tags: data.tags ? JSON.stringify(data.tags) : null,
});

export const transformTaskFromDB = (task) => ({
  ...task,
  date: formatDateFromDB(task.date),
  notes: task.description,
  tags: task.tags ? JSON.parse(task.tags) : [],
});
