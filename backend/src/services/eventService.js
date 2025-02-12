// src/services/eventService.js
import { PrismaClient } from "@prisma/client";

export class EventService {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async getAllEvents() {
    try {
      const events = await this.prisma.event.findMany();
      return events.map((event) => ({
        ...event,
        tags: event.tags ? JSON.parse(event.tags) : [],
      }));
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  }

  async createEvent(data) {
    console.log("Creating event with data:", data);

    // Convert frontend data to database schema
    const eventData = {
      title: data.title,
      date: new Date(data.date),
      description: data.notes || "", // Map notes to description
      priority: data.priority,
      status: data.status || "TODO",
      reminder: data.reminder,
      tags: data.tags ? JSON.stringify(data.tags) : null,
    };

    return await this.prisma.event.create({ data: eventData });
  }

  async updateEvent(id, data) {
    const existingEvent = await this.prisma.event.findUnique({ where: { id } });
    if (!existingEvent) {
      throw new Error("Event not found");
    }

    const eventData = {
      title: data.title,
      date: new Date(data.date),
      description: data.notes || "",
      priority: data.priority,
      status: data.status || "TODO",
      reminder: data.reminder,
      tags: data.tags ? JSON.stringify(data.tags) : null,
    };

    return await this.prisma.event.update({
      where: { id },
      data: eventData,
    });
  }

  async getEventById(id) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) {
      throw new Error("Event not found");
    }
    return {
      ...event,
      tags: event.tags ? JSON.parse(event.tags) : [],
    };
  }

  async deleteEvent(id) {
    const event = await this.prisma.event.delete({ where: { id } });
    if (!event) {
      throw new Error("Event not found");
    }
    return event;
  }
}

export default EventService;
