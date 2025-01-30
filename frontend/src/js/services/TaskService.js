// src/js/services/TaskService.js
import {
  transformTaskForDB,
  transformTaskFromDB,
} from "../utils/taskTransform.js";

export class TaskService {
  constructor() {
    this.apiUrl = "http://localhost:3000/api/tasks";
    this.listeners = new Set();
    this.tasks = [];
  }

  // Added back: Listener methods for UI updates
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners() {
    this.listeners.forEach((callback) => callback(this.tasks));
  }

  // Modified: Now updates local cache and notifies listeners
  async getAllTasks() {
    console.log("TaskService: Fetching tasks...");
    try {
      const response = await fetch(this.apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.tasks = await response.json();
      this.notifyListeners();
      return this.tasks;
    } catch (error) {
      console.error("TaskService: Error fetching tasks:", error);
      return [];
    }
  }

  // Modified: Now refreshes tasks after adding
  async addTask(taskData) {
    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
    });
    if (!response.ok) {
      throw new Error("Failed to add task");
    }
    await this.getAllTasks(); // Refresh tasks and notify UI
    return response.json();
  }

  // Modified: Now refreshes tasks after editing
  async editTask(updatedTask) {
    const response = await fetch(`${this.apiUrl}/${updatedTask.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedTask),
    });
    if (!response.ok) {
      throw new Error("Failed to update task");
    }
    await this.getAllTasks(); // Refresh tasks and notify UI
    return response.json();
  }

  // Modified: Now refreshes tasks after deleting
  async deleteTask(taskId) {
    const response = await fetch(`${this.apiUrl}/${taskId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete task");
    }
    await this.getAllTasks(); // Refresh tasks and notify UI
    return response.json();
  }

  // Modified: Now uses local cache
  getTasksForTimeSlot(date, hour) {
    return this.tasks.filter((task) => {
      const taskDate = new Date(task.date);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear() &&
        taskDate.getHours() === hour
      );
    });
  }

  // Modified: Now uses local cache
  getTodayTasks() {
    const today = new Date();
    return this.tasks.filter((task) => {
      const taskDate = new Date(task.date);
      return (
        taskDate.getDate() === today.getDate() &&
        taskDate.getMonth() === today.getMonth() &&
        taskDate.getFullYear() === today.getFullYear()
      );
    });
  }
}
