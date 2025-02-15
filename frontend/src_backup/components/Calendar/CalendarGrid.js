// src/js/components/calendar/CalendarGrid.js
import { Component } from "../Component.js";
import {
  isToday,
  generateTimeSlots,
  getHourFromTimeSlot,
  formatTime,
} from "../../modules/calendar/DateUtils.js";

export class CalendarGrid extends Component {
  constructor(container, eventService) {
    super(container);
    this.eventService = eventService;
    this.timeSlots = generateTimeSlots();
    this.currentWeekStart = null;
    this.scrollTimeout = null;
    this.isAutoScrolling = false;
    this.isModalOpen = false;

    this.setupGlobalEventListeners();
    this.setupEventListeners();
  }

  setState(newState) {
    if (newState.currentWeekStart) {
      this.currentWeekStart = new Date(newState.currentWeekStart);
      this.render();
    }
  }

  setupGlobalEventListeners() {
    document.addEventListener("openEventModal", () => {
      this.isModalOpen = true;
      if (this.scrollTimeout) clearTimeout(this.scrollTimeout);
    });

    document.addEventListener("closeEventModal", () => {
      this.isModalOpen = false;
      this.startScrollTimeout();
    });
  }

  render() {
    if (!this.currentWeekStart) return;

    const gridHTML = `
        <div class="week-grid">
            <!-- Week header -->
            <div class="calendar-header">
                <div class="time-column-header"></div>
                ${this.generateWeekHeaders()}
            </div>

            <!-- Calendar body -->
            <div class="calendar-body">
                <!-- Time Column -->
                <div class="time-column">
                    ${this.generateTimeSlots()}
                </div>

                <!-- Day Columns -->
                ${this.generateDayColumns()}
            </div>
        </div>
    `;

    this.container.innerHTML = gridHTML;
  }

  generateTimeSlots() {
    const slots = [];
    // Start at 6 AM, go until 4 AM (23 slots)
    for (let i = 0; i < 23; i++) {
      const hour = (i + 6) % 24; // This will wrap around after midnight

      const timeString =
        hour === 0
          ? "12:00 AM"
          : hour < 12
          ? `${hour}:00 AM`
          : hour === 12
          ? "12:00 PM"
          : `${hour - 12}:00 PM`;

      slots.push(`
        <div class="time-slot">
            ${timeString}
        </div>
      `);
    }
    return slots.join("");
  }

  generateWeekHeaders() {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days
      .map(
        (day) => `
        <div class="day-header">${day}</div>
    `
      )
      .join("");
  }

  generateDayColumns() {
    return Array.from(
      { length: 7 },
      (_, dayIndex) => `
        <div class="day-column">
            ${this.generateTimeCellsForDay(dayIndex)}
        </div>
    `
    ).join("");
  }

  generateTimeCellsForDay(dayIndex) {
    // Generate cells from 6am to 4am next day (23 hours)
    return Array.from(
      { length: 23 },
      (_, hour) => `
        <div class="time-cell" data-hour="${(hour + 6) % 24}"></div>
      `
    ).join("");
  }

  generateEventPreview(event) {
    const eventDate = new Date(event.date);
    return `
      <article class="event-preview ${event.priority || "low"}" 
               data-event-id="${event.id}" 
               data-event='${encodeURIComponent(JSON.stringify(event))}'>
        <div class="event-content">
          <div class="event-title">${event.title}</div>
          <time class="event-time" datetime="${eventDate.toISOString()}">
            ${formatTime(event.date)}
          </time>
        </div>
      </article>
    `;
  }

  setupEventListeners() {
    this.container.addEventListener("click", this.handleClick.bind(this));
  }

  handleClick(e) {
    const eventPreview = e.target.closest(".event-preview");
    if (eventPreview) {
      this.handleEventClick(eventPreview);
      return;
    }

    const timeCell = e.target.closest(".time-cell");
    if (timeCell) {
      this.handleTimeCellClick(timeCell);
    }
  }

  handleEventClick(eventPreview) {
    try {
      const event = JSON.parse(decodeURIComponent(eventPreview.dataset.event));
      document.dispatchEvent(
        new CustomEvent("openEventDetails", {
          detail: { event },
        })
      );
    } catch (error) {
      console.error("Error handling event click:", error);
    }
  }

  handleTimeCellClick(timeCell) {
    const { date, hour } = timeCell.dataset;
    if (date) {
      document.dispatchEvent(
        new CustomEvent("openEventModal", {
          detail: {
            date: new Date(date).toISOString().split("T")[0],
            hour: parseInt(hour) || new Date().getHours(),
          },
        })
      );
    }
  }

  scrollToCurrentTime() {
    const currentHour = new Date().getHours();
    const timeSlot = this.container.querySelector(
      `[data-hour="${currentHour}"]`
    );
    if (timeSlot) {
      timeSlot.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }
}
