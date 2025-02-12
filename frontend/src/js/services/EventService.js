// src/js/services/EventService.js
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

  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners() {
    this.listeners.forEach((callback) => callback(this.events));
  }

  async getAllEvents() {
    console.log("EventService: Fetching events...");
    try {
      const response = await fetch(this.apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.events = await response.json();
      this.notifyListeners();
      return this.events;
    } catch (error) {
      console.error("EventService: Error fetching events:", error);
      return [];
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
      });

      if (!response.ok) {
        throw new Error("Failed to add event");
      }
      await this.getAllEvents(); // Refresh events and notify UI
      return response.json();
    } catch (error) {
      console.error("Error adding event:", error);
      throw error;
    }
  }

  async editEvent(updatedEvent) {
    try {
      const response = await fetch(`${this.apiUrl}/${updatedEvent.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedEvent),
      });

      if (!response.ok) {
        throw new Error("Failed to update event");
      }
      await this.getAllEvents(); // Refresh events and notify UI
      return response.json();
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  }

  async deleteEvent(eventId) {
    if (!eventId) {
      return { success: false, message: "Event ID is required for deletion" };
    }

    try {
      const response = await fetch(`${this.apiUrl}/${eventId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete event: ${response.statusText}`);
      }

      await this.getAllEvents(); // Refresh events and notify UI
      return {
        success: true,
        message: "Event deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting event:", error);
      return {
        success: false,
        message: error.message || "Failed to delete event",
      };
    }
  }

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

export default EventService;
