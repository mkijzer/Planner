import { Calendar } from "./components/calendar/Calendar.js";
import { MiniCalendar } from "./components/mini-calendar/MiniCalendar.js";
import { TaskService } from "./services/TaskService.js";
import { TaskList } from "./components/tasks/TaskList.js";
import { TaskModal } from "./components/tasks/TaskModal.js";

class TaskManager {
  constructor(taskService) {
    this.taskService = taskService;
  }

  async addTask(taskData) {
    try {
      await this.taskService.addTask(taskData);
    } catch (error) {
      console.error("Error adding task:", error);
    }
  }

  async editTask(taskData) {
    try {
      await this.taskService.editTask(taskData);
    } catch (error) {
      console.error("Error editing task:", error);
    }
  }

  async deleteTask(taskId) {
    try {
      await this.taskService.deleteTask(taskId);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const taskService = new TaskService();
  const taskManager = new TaskManager(taskService);

  const calendarContainer = document.querySelector(".month-container");
  const todayTasksContainer = document.querySelector(".today-tasks");

  // Initialize components
  const taskList = new TaskList(todayTasksContainer, taskService);
  const calendar = new Calendar(calendarContainer, taskService);
  const taskModal = new TaskModal(taskManager);

  const miniCalendarContainer = document.querySelector(".mini-calendar");
  if (miniCalendarContainer) {
    new MiniCalendar(miniCalendarContainer, calendar);
  }
});
