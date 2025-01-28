import { Calendar } from "./components/calendar/Calendar.js";
import { MiniCalendar } from "./components/mini-calendar/MiniCalendar.js";
import { TaskService } from "./services/TaskService.js";
import { TaskList } from "./components/tasks/TaskList.js";
import { TaskModal } from "./components/tasks/TaskModal.js";

class TaskManager {
  constructor(taskService) {
    this.taskService = taskService;
  }

  addTask(taskData) {
    this.taskService.addTask(taskData);
  }

  editTask(taskData) {
    this.taskService.editTask(taskData);
  }

  deleteTask(taskId) {
    this.taskService.deleteTask(taskId);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const taskService = new TaskService();
  const taskManager = new TaskManager(taskService);

  const calendarContainer = document.querySelector(".month-container");
  if (!calendarContainer) {
    console.error("Calendar container not found");
    return;
  }

  const tasksListContainer = document.querySelector(".aside-today");
  const taskList = new TaskList(tasksListContainer, taskService);
  const calendar = new Calendar(calendarContainer, taskService);
  const taskModal = new TaskModal(taskManager);

  const miniCalendarContainer = document.querySelector(".mini-calendar");
  if (miniCalendarContainer) {
    new MiniCalendar(miniCalendarContainer, calendar);
  }
});
