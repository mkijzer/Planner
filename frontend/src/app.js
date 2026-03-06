/**
 * Main Application Entry Point
 *
 * Initializes and coordinates all calendar application components with
 * consistent dependency injection, centralized error handling, and cleanup support.
 */

// Import core services
import { EventService } from "./services/EventService.js";

// Import UI components
import { Calendar } from "./components/Calendar/Calendar.js";
import { MiniCalendar } from "./components/MiniCalendar.js";
import { EventList } from "./components/Events/EventList.js";
import { EventModal } from "./components/Events/EventModal.js";

// Import utilities
import { ThemeManager } from "./utils/themeManager.js";

/**
 * Application Configuration
 * Centralized selectors and settings
 */
const APP_CONFIG = {
  selectors: {
    calendar: ".month-container",
    todayEvents: ".today-events",
    miniCalendar: ".mini-calendar",
  },
  required: ["calendar", "todayEvents"], // Required containers
  optional: ["miniCalendar"], // Optional containers
};

/**
 * EventManager Class
 *
 * Handles all event operations (CRUD) with proper error handling.
 * Acts as a bridge between UI components and the EventService.
 */
class EventManager {
  constructor(eventService) {
    this.eventService = eventService;
  }

  /**
   * Add a new event
   * @param {Object} eventData - Event data to be added
   */
  async addEvent(eventData) {
    try {
      await this.eventService.addEvent(eventData);
    } catch (error) {
      console.error("Error adding event:", error);
      this.showUserError("Failed to add event. Please try again.");
      throw error;
    }
  }

  /**
   * Edit an existing event
   * @param {Object} eventData - Updated event data
   */
  async editEvent(eventData) {
    try {
      await this.eventService.editEvent(eventData);
    } catch (error) {
      console.error("Error editing event:", error);
      this.showUserError("Failed to update event. Please try again.");
      throw error;
    }
  }

  /**
   * Delete an event
   * @param {string} eventId - ID of event to delete
   */
  async deleteEvent(eventId) {
    try {
      await this.eventService.deleteEvent(eventId);
    } catch (error) {
      console.error("Error deleting event:", error);
      this.showUserError("Failed to delete event. Please try again.");
      throw error;
    }
  }

  /**
   * Show error message to user
   * @param {string} message - Error message to display
   */
  showUserError(message) {
    // TODO: Replace with proper toast/notification system
    alert(message);
  }
}

/**
 * Application Class
 *
 * Main application controller with cleanup support
 */
class CalendarApp {
  constructor() {
    this.components = {};
    this.services = {};
    this.isInitialized = false;
  }

  /**
   * Validate required DOM containers exist
   * @returns {Object} Container validation results
   */
  validateContainers() {
    const containers = {};
    const missing = [];

    // Check required containers
    APP_CONFIG.required.forEach((key) => {
      const element = document.querySelector(APP_CONFIG.selectors[key]);
      if (element) {
        containers[key] = element;
      } else {
        missing.push(key);
      }
    });

    // Check optional containers
    APP_CONFIG.optional.forEach((key) => {
      const element = document.querySelector(APP_CONFIG.selectors[key]);
      if (element) {
        containers[key] = element;
      }
    });

    return { containers, missing };
  }

  /**
   * Show initialization error to user
   * @param {Array} missingContainers - List of missing container keys
   */
  showInitError(missingContainers) {
    const message = `Calendar app failed to initialize. Missing containers: ${missingContainers.join(", ")}`;
    console.error(message);

    // Show user-friendly error
    const errorDiv = document.createElement("div");
    errorDiv.className = "app-error";
    errorDiv.innerHTML = `
      <h3>Calendar Not Available</h3>
      <p>Sorry, the calendar couldn't load properly. Please refresh the page.</p>
    `;
    document.body.appendChild(errorDiv);
  }

  /**
   * Initialize application services and components
   */
  async initialize() {
    try {
      // Validate DOM containers
      const { containers, missing } = this.validateContainers();

      if (missing.length > 0) {
        this.showInitError(missing);
        return false;
      }

      // Initialize theme management
      this.services.themeManager = new ThemeManager();

      // Initialize core services
      this.services.eventService = new EventService();
      this.services.eventManager = new EventManager(this.services.eventService);

      // Initialize UI components with consistent dependency injection
      this.components.eventList = new EventList(
        containers.todayEvents,
        this.services.eventService,
      );

      this.components.calendar = new Calendar(
        containers.calendar,
        this.services.eventService,
      );

      this.components.eventModal = new EventModal(this.services.eventManager);

      // Initialize optional components
      if (containers.miniCalendar) {
        this.components.miniCalendar = new MiniCalendar(
          containers.miniCalendar,
          this.components.calendar,
          this.services.eventService,
        );
      }

      this.isInitialized = true;
      console.log("Calendar application initialized successfully");
      return true;
    } catch (error) {
      console.error("Failed to initialize calendar app:", error);
      this.showInitError(["initialization"]);
      return false;
    }
  }

  /**
   * Cleanup application resources
   * Call this before page unload or SPA navigation
   */
  destroy() {
    // Cleanup components that support it
    Object.values(this.components).forEach((component) => {
      if (component && typeof component.destroy === "function") {
        component.destroy();
      }
    });

    // Clear references
    this.components = {};
    this.services = {};
    this.isInitialized = false;

    console.log("Calendar application cleaned up");
  }
}

/**
 * Global app instance
 */
let appInstance = null;

/**
 * Initialize application when DOM is ready
 */
async function startApp() {
  // Cleanup previous instance if exists
  if (appInstance) {
    appInstance.destroy();
  }

  // Create and initialize new app instance
  appInstance = new CalendarApp();
  const success = await appInstance.initialize();

  if (!success) {
    console.error("Application failed to start");
  }
}

// Start application when DOM is ready
document.addEventListener("DOMContentLoaded", startApp);

// Cleanup on page unload (for SPA compatibility)
window.addEventListener("beforeunload", () => {
  if (appInstance) {
    appInstance.destroy();
  }
});

// Export for external access if needed
export { appInstance as CalendarApp };
