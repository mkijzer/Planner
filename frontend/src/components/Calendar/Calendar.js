// src/js/components/calendar/Calendar.js
import { Component } from "../shared/Component.js";
import { CalendarGrid } from "./CalendarGrid.js";
import { CalendarHeader } from "./CalendarHeader.js";
import { getWeekStart, formatTime } from "../../modules/calendar/DateUtils.js";

export class Calendar extends Component {
  constructor(container, eventService) {
    if (!container) {
      throw new Error("Calendar container is required");
    }
    super(container);
    this.eventService = eventService;
    this.currentWeekStart = getWeekStart(new Date());
    this.state = {
      currentWeekStart: this.currentWeekStart,
    };
    this.initialize();
    this.setupEventListeners();
  }

  initialize() {
    // First create required containers if they don't exist
    if (!this.container.querySelector(".month-nav")) {
      const monthNav = document.createElement("div");
      monthNav.className = "month-nav";
      this.container.appendChild(monthNav);
    }

    if (!this.container.querySelector(".calendar-grid-days")) {
      const gridDays = document.createElement("div");
      gridDays.className = "calendar-grid-days";
      this.container.appendChild(gridDays);
    }

    const headerContainer = this.container.querySelector(".month-nav");
    const gridContainer = this.container.querySelector(".calendar-grid-days");

    // Initialize components
    this.header = new CalendarHeader(headerContainer);
    this.grid = new CalendarGrid(gridContainer, this.eventService);
    this.updateComponents();
  }

  setupEventListeners() {
    // Event changes
    if (
      this.eventService &&
      typeof this.eventService.addListener === "function"
    ) {
      this.eventService.addListener(() => {
        this.grid.render();
        this.updateTodayEvents();
      });
    }

    // Week changes
    document.addEventListener("weekChange", (e) => {
      this.currentWeekStart = e.detail.date;
      this.updateComponents();
    });
  }

  updateComponents() {
    if (this.header && typeof this.header.setState === "function") {
      this.header.setState({ currentWeekStart: this.currentWeekStart });
    }
    if (this.grid && typeof this.grid.setState === "function") {
      this.grid.setState({ currentWeekStart: this.currentWeekStart });
    }
  }

  updateTodayEvents() {
    const todayContainer = document.querySelector(".today-events");
    if (!todayContainer) return;

    const todayEvents = this.eventService.getTodayEvents();

    if (!Array.isArray(todayEvents)) {
      console.error("getTodayEvents did not return an array");
      return;
    }

    todayContainer.innerHTML = todayEvents
      .map((event) => {
        const eventDate = new Date(event.date);
        return `
        <article class="sidebar-event-preview" data-event='${encodeURIComponent(
          JSON.stringify(event)
        )}'>
          <h4 class="event-title">${event.title}</h4>
          <time class="event-time" datetime="${eventDate.toISOString()}">
            ${formatTime(event.date)}
          </time>
        </article>
      `;
      })
      .join("");

    todayContainer.addEventListener("click", (e) => {
      const eventPreview = e.target.closest(".sidebar-event-preview");
      if (eventPreview) {
        try {
          const event = JSON.parse(
            decodeURIComponent(eventPreview.dataset.event)
          );
          document.dispatchEvent(
            new CustomEvent("openEventDetails", { detail: { event } })
          );
        } catch (error) {
          console.error("Error parsing event data:", error);
        }
      }
    });
  }

  navigateToDate(date) {
    this.currentWeekStart = getWeekStart(date);
    this.updateComponents();
  }
}
