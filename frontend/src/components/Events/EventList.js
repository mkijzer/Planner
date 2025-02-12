import Component from "../shared/Component.js";

export class EventList extends Component {
  constructor(container, eventService) {
    const initialState = {
      events: [],
      filter: "today",
    };
    super(container, initialState);

    if (!eventService) {
      throw new Error("EventService is required");
    }
    this.eventService = eventService;
    this.unsubscribe = this.eventService.addListener((events) => {
      this.setState({ events });
    });

    // Move initialize call here after eventService is set
    this.initialize();
  }

  async loadEvents() {
    try {
      const events = await this.eventService.getAllEvents();
      switch (this.state.filter) {
        case "today":
          this.renderEvents(this.filterEvents(events));
          break;
        case "upcoming":
          this.renderEvents(this.filterEvents(events));
          break;
        case "all":
          this.renderEvents(events);
          break;
      }
    } catch (error) {
      console.error("Error loading events:", error);
    }
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

  render() {
    const filteredEvents = this.filterEvents(this.state.events);

    if (filteredEvents.length === 0) {
      this.container.innerHTML = '<p class="no-events">No events found.</p>';
      return;
    }

    this.renderEvents(filteredEvents);
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

  createEventElement(event) {
    // Add console.log to debug
    console.log("Creating event element for:", event);

    // Encode the event data
    const encodedEvent = encodeURIComponent(JSON.stringify(event));

    const eventElement = this.createElementFromHTML(`
      <div class="sidebar-event-preview" data-event-id="${
        event.id
      }" data-event='${encodedEvent}'>
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
      this.handleEventClick(event);
    });

    return eventElement;
  }

  handleEventClick(event) {
    try {
      const eventData = typeof event === "string" ? JSON.parse(event) : event;
      document.dispatchEvent(
        new CustomEvent("openEventDetails", {
          detail: { event: eventData },
        })
      );
    } catch (error) {
      console.error("Error handling event click:", error);
    }
  }

  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
