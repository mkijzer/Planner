// src/js/services/TaskService.js

export class TaskService {
  constructor() {
    this.tasks = [];
    this.listeners = new Set();
  }

  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback); // Return unsubscribe function
  }

  notifyListeners() {
    this.listeners.forEach((callback) => callback(this.tasks));
  }

  addTask(taskData) {
    this.tasks.push(taskData);
    this.notifyListeners();
  }

  deleteTask(taskId) {
    this.tasks = this.tasks.filter((task) => task.id !== taskId);
    this.notifyListeners();
  }

  editTask(updatedTask) {
    const index = this.tasks.findIndex((task) => task.id === updatedTask.id);
    if (index !== -1) {
      this.tasks[index] = updatedTask;
      this.notifyListeners();
    }
  }

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
