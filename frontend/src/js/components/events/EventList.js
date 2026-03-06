/**
 * EventList Component
 *
 * Displays a filtered list of events in the sidebar with support for:
 * - Today's events filter
 * - Upcoming events filter
 * - All events view
 * - Real-time updates via EventService
 */

import { Component } from "../Component.js";

/**
 * Date utility functions for consistent timezone handling
 */
const DateUtils = {
  /**
   * Get start of day in local timezone
   * @param {Date} date - Date to get start of day for
   * @returns {Date} Start of day
   */
  getStartOfDay(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  },

  /**
   * Get end of day in local timezone
   * @param {Date} date - Date to get end of day for
   * @returns {Date} End of day
   */
  getEndOfDay(date = new Date()) {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23,
      59,
      59,
      999,
    );
  },
};

export class EventList extends Component {
  /**
   * Create EventList instance
   * @param {HTMLElement} container - DOM container for the event list
   * @param {EventService} eventService - Service for event operations
   */
  constructor(container, eventService) {
    const initialState = {
      events: [],
      filteredEvents: [], // Cache filtered results
      filter: "today",
      loading: false,
      error: null,
    };

    // Input validation
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

    // Store dependencies
    this.eventService = eventService;

    // Cache DOM elements to avoid repeated queries
    this.filterButtons = null;

    // Set up listener for real-time event updates
    this.unsubscribe = this.eventService.addListener((events) => {
      this.handleEventUpdates(events);
    });

    // Initialize component
    this.initializeEventList();
  }

  /**
   * Handle real-time event updates from service
   * @param {Array} events - Updated events array
   */
  handleEventUpdates(events) {
    this.setState({
      events,
      filteredEvents: this.filterEvents(events, this.state.filter),
    });
  }

  /**
   * Initialize the event list component
   */
  async initializeEventList() {
    try {
      this.cacheFilterButtons();
      this.setupFilterButtons();
      await this.loadEvents();
    } catch (error) {
      console.error("Error initializing EventList:", error);
      this.showError(error.message);
    }
  }

  /**
   * Cache filter button references to avoid repeated DOM queries
   */
  cacheFilterButtons() {
    this.filterButtons = document.querySelectorAll(".event-filter-btn");
  }

  /**
   * Set up event listeners for filter buttons
   */
  setupFilterButtons() {
    if (!this.filterButtons) return;

    this.filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        this.handleFilterChange(button);
      });
    });
  }

  /**
   * Handle filter button click
   * @param {HTMLElement} clickedButton - The clicked filter button
   */
  handleFilterChange(clickedButton) {
    // Update button states
    this.filterButtons.forEach((btn) => btn.classList.remove("active"));
    clickedButton.classList.add("active");

    // Update filter and re-render
    const newFilter = clickedButton.dataset.filter;
    const filteredEvents = this.filterEvents(this.state.events, newFilter);

    this.setState({
      filter: newFilter,
      filteredEvents,
    });
  }

  /**
   * Load events from service with loading state
   */
  async loadEvents() {
    try {
      this.setState({ loading: true, error: null });
      this.renderLoadingState();

      const events = await this.eventService.getAllEvents();
      const filteredEvents = this.filterEvents(events, this.state.filter);

      this.setState({
        events,
        filteredEvents,
        loading: false,
      });
    } catch (error) {
      console.error("Error loading events in EventList:", error);
      this.setState({
        loading: false,
        error: error.message,
      });
      this.showError(error.message);
    }
  }

  /**
   * Filter events based on selected filter with proper timezone handling
   * @param {Array} events - Events to filter
   * @param {string} filter - Filter type ('today', 'upcoming', 'all')
   * @returns {Array} Filtered events
   */
  filterEvents(events, filter) {
    if (!Array.isArray(events)) return [];

    const startOfToday = DateUtils.getStartOfDay();
    const endOfToday = DateUtils.getEndOfDay();

    switch (filter) {
      case "today":
        return events.filter((event) => {
          const eventDate = new Date(event.date);
          return eventDate >= startOfToday && eventDate <= endOfToday;
        });

      case "upcoming":
        return events.filter((event) => {
          const eventDate = new Date(event.date);
          return eventDate > endOfToday;
        });

      case "all":
      default:
        return events;
    }
  }

  /**
   * Render component based on current state
   */
  render() {
    if (this.state.loading) {
      this.renderLoadingState();
      return;
    }

    if (this.state.error) {
      this.showError(this.state.error);
      return;
    }

    if (this.state.filteredEvents.length === 0) {
      this.renderEmptyState();
      return;
    }

    this.renderEvents(this.state.filteredEvents);
  }

  /**
   * Show loading spinner
   */
  renderLoadingState() {
    this.container.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Loading events...</p>
      </div>
    `;
  }

  /**
   * Show empty state message
   */
  renderEmptyState() {
    const filterText =
      this.state.filter === "all" ? "events" : `${this.state.filter} events`;
    this.container.innerHTML = `
      <div class="no-events">
        <p>No ${filterText} found.</p>
      </div>
    `;
  }

  /**
   * Show error message to user
   * @param {string} message - Error message to display
   */
  showError(message) {
    this.container.innerHTML = `
      <div class="error-message">
        <p>Unable to load events.</p>
        <button class="retry-btn" onclick="location.reload()">
          Refresh Page
        </button>
        <details>
          <summary>Error Details</summary>
          <p>${this.escapeHtml(message)}</p>
        </details>
      </div>
    `;
  }

  /**
   * Render events list with efficient DOM updates
   * @param {Array} events - Events to render
   */
  renderEvents(events) {
    // Create document fragment for efficient DOM manipulation
    const fragment = document.createDocumentFragment();
    const eventsList = document.createElement("div");
    eventsList.className = "events-list";

    events.forEach((event) => {
      const eventElement = this.createEventElement(event);
      eventsList.appendChild(eventElement);
    });

    fragment.appendChild(eventsList);

    // Single DOM update
    this.container.innerHTML = "";
    this.container.appendChild(fragment);
  }

  /**
   * Create individual event element with safe HTML
   * @param {Object} event - Event data
   * @returns {HTMLElement} Event DOM element
   */
  createEventElement(event) {
    // Create elements safely without innerHTML
    const eventElement = document.createElement("div");
    eventElement.className = "sidebar-event-preview";
    eventElement.dataset.eventId = event.id;

    // Create title element
    const titleElement = document.createElement("h4");
    titleElement.textContent = event.title; // Safe text content
    eventElement.appendChild(titleElement);

    // Create time element
    const timeElement = document.createElement("time");
    timeElement.textContent = new Date(event.date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    timeElement.dateTime = new Date(event.date).toISOString();
    eventElement.appendChild(timeElement);

    // Create priority indicator
    const priorityElement = document.createElement("div");
    priorityElement.className = `event-preview-priority ${event.priority || "low"}`;
    priorityElement.setAttribute(
      "aria-label",
      `Priority: ${event.priority || "low"}`,
    );
    eventElement.appendChild(priorityElement);

    // Add click handler
    eventElement.addEventListener("click", () => {
      this.handleEventClick(event);
    });

    return eventElement;
  }

  /**
   * Handle event click with proper event dispatching
   * @param {Object} event - Event data
   */
  handleEventClick(event) {
    document.dispatchEvent(
      new CustomEvent("openEventDetails", {
        detail: { event },
        bubbles: true, // Allow event bubbling
      }),
    );
  }

  /**
   * Escape HTML to prevent XSS attacks
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Clean up component resources
   * Called when component is destroyed
   */
  destroy() {
    // Unsubscribe from event service updates
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }

    // Remove event listeners from cached filter buttons
    if (this.filterButtons) {
      this.filterButtons.forEach((button) => {
        button.replaceWith(button.cloneNode(true));
      });
      this.filterButtons = null;
    }

    // Clear container
    if (this.container) {
      this.container.innerHTML = "";
    }

    console.log("EventList component destroyed");
  }
}
