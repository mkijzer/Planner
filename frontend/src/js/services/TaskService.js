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

  // Listener methods for UI updates
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(tasks) {
    this.listeners.forEach((callback) => callback(tasks));
  }

  async getAllTasks() {
    console.log("TaskService: Fetching tasks...");
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
        throw new Error(`Failed to fetch tasks: ${errorText}`);
      }

      const tasksFromDB = await response.json();
      // Map description to notes for each task
      this.tasks = tasksFromDB.map((task) => ({
        ...task,
        notes: task.description,
      }));

      this.notifyListeners(this.tasks);
      return this.tasks;
    } catch (error) {
      console.error("TaskService: Error fetching tasks:", error);
      throw error;
    }
  }

  async addTask(taskData) {
    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
        credentials: "include", // This helps with CORS if using cookies/credentials
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error! status: ${response.status}`, errorText);
        throw new Error(`Failed to add task: ${errorText}`);
      }

      const addedTask = await response.json();
      await this.getAllTasks(); // Refresh tasks and notify UI
      return addedTask;
    } catch (error) {
      console.error("TaskService: Error adding task:", error);
      throw error; // Re-throw to allow caller to handle
    }
  }

  async editTask(taskData) {
    try {
      // Prepare the data for the backend
      const dataForBackend = {
        ...taskData,
        description: taskData.notes, // Map notes to description for backend
      };

      const response = await fetch(`${this.apiUrl}/${taskData.id}`, {
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
        throw new Error(`Failed to update task: ${errorText}`);
      }

      const updatedTask = await response.json();
      // Map description back to notes for frontend
      const taskForFrontend = {
        ...updatedTask,
        notes: updatedTask.description,
      };

      await this.getAllTasks(); // Refresh tasks and notify UI
      return taskForFrontend;
    } catch (error) {
      console.error("TaskService: Error editing task:", error);
      throw error;
    }
  }

  async deleteTask(taskId) {
    try {
      const response = await fetch(`${this.apiUrl}/${taskId}`, {
        method: "DELETE",
        credentials: "include", // This helps with CORS if using cookies/credentials
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error! status: ${response.status}`, errorText);
        throw new Error(`Failed to delete task: ${errorText}`);
      }

      const deletedTask = await response.json();
      await this.getAllTasks(); // Refresh tasks and notify UI
      return deletedTask;
    } catch (error) {
      console.error("TaskService: Error deleting task:", error);
      throw error; // Re-throw to allow caller to handle
    }
  }

  // Uses local cache to filter tasks
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

  // Uses local cache to filter today's tasks
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
