import { PrismaClient } from "@prisma/client";

const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

const eventService = {
  // Keep your existing methods but add better error messages
  async getAllEvents() {
    try {
      const events = await prisma.event.findMany({
        orderBy: { date: "asc" }, // Add sorting
      });
      return events.map((event) => ({
        ...event,
        tags: event.tags ? JSON.parse(event.tags) : [],
      }));
    } catch (error) {
      console.error("Database error in getAllEvents:", error);
      throw new Error("Failed to fetch events");
    }
  },

  async createEvent(data) {
    try {
      console.log("Creating event with data:", JSON.stringify(data, null, 2));

      // Validate required fields
      if (!data.title) {
        throw new Error("Title is required");
      }
      if (!data.date) {
        throw new Error("Date is required");
      }

      const eventData = {
        title: data.title,
        date: new Date(data.date),
        description: data.notes || "", // Map notes to description
        priority: data.priority || null,
        status: data.status || "TODO",
        reminder: data.reminder || null,
        tags:
          data.tags && data.tags.length > 0 ? JSON.stringify(data.tags) : null,
      };

      console.log("Processed event data:", JSON.stringify(eventData, null, 2));

      const createdEvent = await prisma.event.create({
        data: eventData,
      });

      console.log("Created event:", JSON.stringify(createdEvent, null, 2));

      return {
        ...createdEvent,
        tags: data.tags || [], // Return original tags array
      };
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  },

  async updateEvent(id, data) {
    try {
      const existingEvent = await prisma.event.findUnique({ where: { id } });
      if (!existingEvent) {
        throw new Error("Event not found");
      }

      const eventData = {
        title: data.title,
        date: new Date(data.date),
        description: data.notes || "",
        priority: data.priority || null,
        status: data.status || "TODO",
        reminder: data.reminder || null,
        tags:
          data.tags && data.tags.length > 0 ? JSON.stringify(data.tags) : null,
      };

      const updatedEvent = await prisma.event.update({
        where: { id },
        data: eventData,
      });

      return {
        ...updatedEvent,
        tags: data.tags || [], // Return original tags array
      };
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  },

  async getEventById(id) {
    try {
      const event = await prisma.event.findUnique({ where: { id } });
      if (!event) {
        throw new Error("Event not found");
      }

      return {
        ...event,
        tags: event.tags ? JSON.parse(event.tags) : [],
      };
    } catch (error) {
      console.error("Error fetching event by ID:", error);
      throw error;
    }
  },

  async deleteEvent(id) {
    try {
      const event = await prisma.event.delete({ where: { id } });
      if (!event) {
        throw new Error("Event not found");
      }
      return event;
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  },
};

export default eventService;
