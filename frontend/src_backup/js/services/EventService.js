import {
  transformEventForDB,
  transformEventFromDB,
} from "../utils/eventTransform.js";

export class EventService {
  constructor() {
    this.apiUrl = "http://localhost:3000/api/events";
    this.listeners = new Set();
    this.events = [];
  }

  // Listener methods for UI updates
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(events) {
    this.listeners.forEach((callback) => callback(events));
  }

  async getAllEvents() {
    console.log("EventService: Fetching events...");
    try {
      const response = await fetch(this.apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error! status: ${response.status}`, errorText);
        throw new Error(`Failed to fetch events: ${errorText}`);
      }

      const eventsFromDB = await response.json();
      // Map description to notes for each event
      this.events = eventsFromDB.map((event) => ({
        ...event,
        notes: event.description,
      }));

      this.notifyListeners(this.events);
      return this.events;
    } catch (error) {
      console.error("EventService: Error fetching events:", error);
      throw error;
    }
  }

  async addEvent(eventData) {
    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
        credentials: "include", // This helps with CORS if using cookies/credentials
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error! status: ${response.status}`, errorText);
        throw new Error(`Failed to add event: ${errorText}`);
      }

      const addedEvent = await response.json();
      await this.getAllEvents(); // Refresh events and notify UI
      return addedEvent;
    } catch (error) {
      console.error("EventService: Error adding event:", error);
      throw error; // Re-throw to allow caller to handle
    }
  }

  async editEvent(eventData) {
    try {
      // Prepare the data for the backend
      const dataForBackend = {
        ...eventData,
        description: eventData.notes, // Map notes to description for backend
      };

      const response = await fetch(`${this.apiUrl}/${eventData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataForBackend),
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error! status: ${response.status}`, errorText);
        throw new Error(`Failed to update event: ${errorText}`);
      }

      const updatedEvent = await response.json();
      // Map description back to notes for frontend
      const eventForFrontend = {
        ...updatedEvent,
        notes: updatedEvent.description,
      };

      await this.getAllEvents(); // Refresh events and notify UI
      return eventForFrontend;
    } catch (error) {
      console.error("EventService: Error editing event:", error);
      throw error;
    }
  }

  async deleteEvent(eventId) {
    try {
      const response = await fetch(`${this.apiUrl}/${eventId}`, {
        method: "DELETE",
        credentials: "include", // This helps with CORS if using cookies/credentials
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error! status: ${response.status}`, errorText);
        throw new Error(`Failed to delete event: ${errorText}`);
      }

      const deletedEvent = await response.json();
      await this.getAllEvents(); // Refresh events and notify UI
      return deletedEvent;
    } catch (error) {
      console.error("EventService: Error deleting event:", error);
      throw error; // Re-throw to allow caller to handle
    }
  }

  // Uses local cache to filter events
  getEventsForTimeSlot(date, hour) {
    return this.events.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getHours() === hour
      );
    });
  }

  // Uses local cache to filter today's events
  getTodayEvents() {
    const today = new Date();
    return this.events.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === today.getDate() &&
        eventDate.getMonth() === today.getMonth() &&
        eventDate.getFullYear() === today.getFullYear()
      );
    });
  }
}
