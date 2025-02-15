// frontend/src/app.js
import { Calendar } from "./components/Calendar/Calendar.js";
import { MiniCalendar } from "./components/Calendar/MiniCalendar.js";
import { EventService } from "./services/EventService.js";
import { EventList } from "./components/Events/EventList.js";
import { EventModal } from "./components/Events/EventModal.js";
import { ThemeToggle } from "./utils/themeToggle.js";

document.addEventListener("DOMContentLoaded", () => {
  class EventManager {
    constructor(eventService) {
      this.eventService = eventService;
    }

    async addEvent(eventData) {
      try {
        await this.eventService.addEvent(eventData);
      } catch (error) {
        console.error("Error adding event:", error);
      }
    }

    async editEvent(eventData) {
      try {
        await this.eventService.editEvent(eventData);
      } catch (error) {
        console.error("Error editing event:", error);
      }
    }

    async deleteEvent(eventId) {
      try {
        await this.eventService.deleteEvent(eventId);
      } catch (error) {
        console.error("Error deleting event:", error);
      }
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const eventService = new EventService();
    const eventManager = new EventManager(eventService);

    const calendarContainer = document.querySelector(".month-container");
    const todayEventsContainer = document.querySelector(".today-events");

    // Initialize components
    const eventList = new EventList(todayEventsContainer, eventService);
    const calendar = new Calendar(calendarContainer, eventService);
    const eventModal = new EventModal(eventManager);

    const miniCalendarContainer = document.querySelector(".mini-calendar");
    if (miniCalendarContainer) {
      new MiniCalendar(miniCalendarContainer, calendar, eventService);
    }

    new ThemeToggle();
  });
});
