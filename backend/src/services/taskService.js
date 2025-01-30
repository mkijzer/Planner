// src/services/taskService.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const taskService = {
  async getAllTasks() {
    const tasks = await prisma.task.findMany();
    // Convert stored JSON string back to array
    return tasks.map((task) => ({
      ...task,
      tags: task.tags ? JSON.parse(task.tags) : [],
    }));
  },

  async createTask(data) {
    console.log("Creating task with data:", data);

    // Convert frontend data to database schema
    const taskData = {
      title: data.title,
      date: new Date(data.date),
      description: data.notes || "", // Map notes to description
      priority: data.priority,
      status: data.status || "TODO",
      reminder: data.reminder,
      tags: data.tags ? JSON.stringify(data.tags) : null,
    };

    return await prisma.task.create({ data: taskData });
  },

  async updateTask(id, data) {
    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) {
      throw new Error("Task not found");
    }

    const taskData = {
      title: data.title,
      date: new Date(data.date),
      description: data.notes || "",
      priority: data.priority,
      status: data.status || "TODO",
      reminder: data.reminder,
      tags: data.tags ? JSON.stringify(data.tags) : null,
    };

    return await prisma.task.update({
      where: { id },
      data: taskData,
    });
  },

  async getTaskById(id) {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      throw new Error("Task not found");
    }
    return {
      ...task,
      tags: task.tags ? JSON.parse(task.tags) : [],
    };
  },

  async deleteTask(id) {
    const task = await prisma.task.delete({ where: { id } });
    if (!task) {
      throw new Error("Task not found");
    }
    return task;
  },
};
