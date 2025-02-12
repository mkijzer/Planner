import { PrismaClient } from "@prisma/client";

const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

const taskService = {
  // Keep your existing methods but add better error messages
  async getAllTasks() {
    try {
      const tasks = await prisma.task.findMany({
        orderBy: { date: "asc" }, // Add sorting
      });
      return tasks.map((task) => ({
        ...task,
        tags: task.tags ? JSON.parse(task.tags) : [],
      }));
    } catch (error) {
      console.error("Database error in getAllTasks:", error);
      throw new Error("Failed to fetch tasks");
    }
  },

  async createTask(data) {
    try {
      console.log("Creating task with data:", JSON.stringify(data, null, 2));

      // Validate required fields
      if (!data.title) {
        throw new Error("Title is required");
      }
      if (!data.date) {
        throw new Error("Date is required");
      }

      const taskData = {
        title: data.title,
        date: new Date(data.date),
        description: data.notes || "", // Map notes to description
        priority: data.priority || null,
        status: data.status || "TODO",
        reminder: data.reminder || null,
        tags:
          data.tags && data.tags.length > 0 ? JSON.stringify(data.tags) : null,
      };

      console.log("Processed task data:", JSON.stringify(taskData, null, 2));

      const createdTask = await prisma.task.create({
        data: taskData,
      });

      console.log("Created task:", JSON.stringify(createdTask, null, 2));

      return {
        ...createdTask,
        tags: data.tags || [], // Return original tags array
      };
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  },

  async updateTask(id, data) {
    try {
      const existingTask = await prisma.task.findUnique({ where: { id } });
      if (!existingTask) {
        throw new Error("Task not found");
      }

      const taskData = {
        title: data.title,
        date: new Date(data.date),
        description: data.notes || "",
        priority: data.priority || null,
        status: data.status || "TODO",
        reminder: data.reminder || null,
        tags:
          data.tags && data.tags.length > 0 ? JSON.stringify(data.tags) : null,
      };

      const updatedTask = await prisma.task.update({
        where: { id },
        data: taskData,
      });

      return {
        ...updatedTask,
        tags: data.tags || [], // Return original tags array
      };
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  },

  async getTaskById(id) {
    try {
      const task = await prisma.task.findUnique({ where: { id } });
      if (!task) {
        throw new Error("Task not found");
      }

      return {
        ...task,
        tags: task.tags ? JSON.parse(task.tags) : [],
      };
    } catch (error) {
      console.error("Error fetching task by ID:", error);
      throw error;
    }
  },

  async deleteTask(id) {
    try {
      const task = await prisma.task.delete({ where: { id } });
      if (!task) {
        throw new Error("Task not found");
      }
      return task;
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  },
};

export default taskService;
