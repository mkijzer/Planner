import { Component } from "../Component.js";
import EventService from "../../services/EventService.js";

export class EventList extends Component {
  constructor(container, eventService) {
    super(container);
    if (!eventService) {
      console.error("EventService is required");
      return;
    }
    this.eventService = eventService;
  }

  initialize() {
    if (!this.eventService) return;
    this.setupEventListeners();
    this.loadEvents();
  }

  setupEventListeners() {
    if (!this.eventService) return;

    // Refresh events when changes occur
    this.eventService.addListener(() => {
      this.loadEvents();
    });

    // Event click handler
    if (this.container) {
      this.container.addEventListener("click", (e) => {
        const eventItem = e.target.closest(".event-item");
        if (eventItem) {
          const eventData = JSON.parse(eventItem.dataset.event);
          document.dispatchEvent(
            new CustomEvent("openEventDetails", {
              detail: { event: eventData },
            })
          );
        }
      });
    }
  }

  async loadEvents() {
    if (!this.eventService) return;

    try {
      const events = await this.eventService.getTodayEvents();
      this.render(events);
    } catch (error) {
      console.error("Error loading events:", error);
    }
  }

  render(events = []) {
    if (!this.container) return;

    this.container.innerHTML = "";

    if (events.length === 0) {
      this.container.innerHTML = '<p class="no-events">No events for today</p>';
      return;
    }

    events.forEach((event) => {
      const eventElement = this.createEventElement(event);
      this.container.appendChild(eventElement);
    });
  }

  createEventElement(event) {
    const eventElement = document.createElement("div");
    eventElement.className = `event-item priority-${event.priority || "low"}`;
    eventElement.dataset.event = JSON.stringify(event);

    const time = new Date(event.date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    eventElement.innerHTML = `
      <div class="event-time">${time}</div>
      <div class="event-title">${event.title}</div>
      <div class="event-tags">
        ${
          event.tags
            ? event.tags
                .map((tag) => `<span class="tag">${tag}</span>`)
                .join("")
            : ""
        }
      </div>
    `;

    return eventElement;
  }
}

export default EventList;
