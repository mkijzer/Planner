import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const taskService = {
  async getAllTasks() {
    return await prisma.task.findMany();
  },

  async createTask(data) {
    // if (!data.title) {
    //   throw new Error("Title is required");
    // }
    console.log("Creating task with data:", data); // Add this line to log the data
    return await prisma.task.create({ data });
  },

  async getTaskById(id) {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      throw new Error("Task not found");
    }
    return task;
  },

  async updateTask(id, data) {
    // First, check if the task exists
    const existingTask = await prisma.task.findUnique({ where: { id } });

    if (!existingTask) {
      throw new Error("Task not found");
    }

    // If task exists, proceed with update
    const task = await prisma.task.update({
      where: { id },
      data,
    });

    return task;
  },

  async deleteTask(id) {
    const task = await prisma.task.delete({ where: { id } });
    if (!task) {
      throw new Error("Task not found");
    }
    return task;
  },
};
