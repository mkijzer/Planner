import { Calendar } from "../js/modules/calendar/Calendar.js";
import { CalendarTaskModal } from "../js/modules/calendar/CalendarTaskModal.js";

document.addEventListener("DOMContentLoaded", () => {
  const calendar = new Calendar();
  const taskModal = new CalendarTaskModal(calendar);
});
