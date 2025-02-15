import { Component } from "../../../components/shared/Component.js";

export class EventList extends Component {
  // 1. Constructor and Initialization
  constructor(container, eventService) {
    const initialState = {
      events: [],
      filter: "today",
    };

    // Validate inputs
    if (!container) {
      throw new Error("Container is required to create EventList");
    }

    if (!eventService) {
      throw new Error("EventService is required to create EventList");
    }

    if (typeof eventService.getAllEvents !== "function") {
      throw new Error("Invalid EventService: getAllEvents method is missing");
    }

    // Call parent constructor
    super(container, initialState);

    // Attach eventService
    this.eventService = eventService;

    // Set up listener for event updates
    this.unsubscribe = this.eventService.addListener((events) => {
      this.setState({ events });
    });

    // Initialize
    this.initializeEventList();
  }

  async initializeEventList() {
    try {
      await this.loadEvents();
      this.setupFilterButtons();
    } catch (error) {
      console.error("Error initializing EventList:", error);
      this.container.innerHTML = `
        <div class="error-message">
          <p>Unable to load events. Please refresh the page or contact support.</p>
          <details>${error.message}</details>
        </div>
      `;
    }
  }

  initialize() {
    this.setupFilterButtons();
    this.loadEvents();
  }

  setupFilterButtons() {
    const filterButtons = document.querySelectorAll(".event-filter-btn");
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        filterButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
        this.setState({ filter: button.dataset.filter });
        this.loadEvents();
      });
    });
  }

  // 2. Core Event Operations
  async loadEvents() {
    try {
      const getAllEvents = this.eventService.getAllEvents.bind(
        this.eventService
      );
      const events = await getAllEvents();

      switch (this.state.filter) {
        case "today":
        case "upcoming":
          this.renderEvents(this.filterEvents(events));
          break;
        case "all":
          this.renderEvents(events);
          break;
        default:
          console.warn("Unknown filter:", this.state.filter);
          this.renderEvents(events);
      }
    } catch (error) {
      console.error("Error loading events in EventList:", error);
      throw error;
    }
  }

  filterEvents(events) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (this.state.filter) {
      case "today":
        return events.filter((event) => {
          const eventDate = new Date(event.date);
          return (
            eventDate.getDate() === today.getDate() &&
            eventDate.getMonth() === today.getMonth() &&
            eventDate.getFullYear() === today.getFullYear()
          );
        });

      case "upcoming":
        return events.filter((event) => {
          const eventDate = new Date(event.date);
          return eventDate > today;
        });

      default:
        return events;
    }
  }

  // 3. Rendering Methods
  render() {
    const filteredEvents = this.filterEvents(this.state.events);

    if (filteredEvents.length === 0) {
      this.container.innerHTML = '<p class="no-events">No events found.</p>';
      return;
    }

    this.renderEvents(filteredEvents);
  }

  renderEvents(events) {
    const eventsList = document.createElement("div");
    eventsList.className = "events-list";

    events.forEach((event) => {
      const eventElement = this.createEventElement(event);
      eventsList.appendChild(eventElement);
    });

    this.container.innerHTML = "";
    this.container.appendChild(eventsList);
  }

  createEventElement(event) {
    const eventElement = this.createElementFromHTML(`
      <div class="sidebar-event-preview" data-event-id="${event.id}">
        <h4>${event.title}</h4>
        <time>${new Date(event.date).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })}</time>
        <div class="event-preview-priority ${event.priority}" 
             aria-label="Priority: ${event.priority}">
        </div>
      </div>
    `);

    eventElement.addEventListener("click", () => {
      document.dispatchEvent(
        new CustomEvent("openEventDetails", { detail: { event } })
      );
    });

    return eventElement;
  }

  // 4. Cleanup
  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
