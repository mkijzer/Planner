// src/js/components/calendar/Calendar.js
import { Component } from "../Component.js";
import { CalendarGrid } from "./CalendarGrid.js";
import { CalendarHeader } from "./CalendarHeader.js";
import { getWeekStart, formatTime } from "../../modules/calendar/DateUtils.js";

export class Calendar extends Component {
  constructor(container, eventService) {
    super(container);
    this.eventService = eventService;
    this.currentWeekStart = getWeekStart(new Date());
    this.state = {
      currentWeekStart: this.currentWeekStart,
    };

    this.initialize();
    this.setupEventListener();
  }

  initialize() {
    // Debug containers
    console.log(
      "Header container:",
      this.container.querySelector(".month-nav")
    );
    console.log(
      "Grid container:",
      this.container.querySelector(".calendar-grid-days")
    );

    const headerContainer = this.container.querySelector(".month-nav");
    const gridContainer = this.container.querySelector(".calendar-grid-days");

    if (!headerContainer || !gridContainer) {
      console.error("Required calendar containers not found");
      return;
    }

    this.header = new CalendarHeader(headerContainer);
    this.grid = new CalendarGrid(gridContainer, this.eventService);
    this.updateComponents();
  }

  setupEventListener() {
    // Listen to event changes
    this.eventService.addListener(() => {
      this.grid.render();
      this.updateTodayEvents();
    });

    // Listen to week changes
    document.addEventListener("weekChange", (e) => {
      this.currentWeekStart = e.detail.date;
      this.updateComponents();
    });
  }

  updateComponents() {
    this.header.setState({ currentWeekStart: this.currentWeekStart });
    this.grid.setState({ currentWeekStart: this.currentWeekStart });
  }

  updateTodayEvents() {
    const todayContainer = document.querySelector(".today-events");
    if (!todayContainer) return;

    const todayEvents = this.eventService.getTodayEvents();
    todayContainer.innerHTML = todayEvents
      .map((event) => {
        const eventDate = new Date(event.date);
        return `
          <article class="sidebar-event-preview" data-event='${JSON.stringify(
            event
          )}'>
            <h4 class="event-title">${event.title}</h4>
            <time class="event-time" datetime="${eventDate.toISOString()}">
              ${formatTime(event.date)}
            </time>
          </article>
        `;
      })
      .join("");

    console.log("Calendar initializing with container:", this.container);

    todayContainer.addEventListener("click", (e) => {
      const eventPreview = e.target.closest(".sidebar-event-preview");
      if (eventPreview) {
        const event = JSON.parse(eventPreview.dataset.event);
        document.dispatchEvent(
          new CustomEvent("openEventDetails", { detail: { event } })
        );
      }
    });
  }

  navigateToDate(date) {
    this.currentWeekStart = getWeekStart(date);
    this.updateComponents();
  }
}
