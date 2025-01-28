// src/js/components/calendar/Calendar.js
import { Component } from "../Component.js";
import { CalendarGrid } from "./CalendarGrid.js";
import { CalendarHeader } from "./CalendarHeader.js";
import { getWeekStart, formatTime } from "../../modules/calendar/DateUtils.js";

export class Calendar extends Component {
  constructor(container, taskService) {
    super(container);
    this.taskService = taskService;
    this.currentWeekStart = getWeekStart(new Date());
    this.state = {
      currentWeekStart: this.currentWeekStart,
    };

    this.initialize();
    this.setupTaskListener();
  }

  initialize() {
    // Debug containers
    console.log(
      "Header container:",
      this.container.querySelector(".month-nav")
    );
    console.log(
      "Grid container:",
      this.container.querySelector(".calendar-grid-days")
    );

    const headerContainer = this.container.querySelector(".month-nav");
    const gridContainer = this.container.querySelector(".calendar-grid-days");

    if (!headerContainer || !gridContainer) {
      console.error("Required calendar containers not found");
      return;
    }

    this.header = new CalendarHeader(headerContainer);
    this.grid = new CalendarGrid(gridContainer, this.taskService);
    this.updateComponents();
  }

  setupTaskListener() {
    // Listen to task changes
    this.taskService.addListener(() => {
      this.grid.render();
      this.updateTodayTasks();
    });

    // Listen to week changes
    document.addEventListener("weekChange", (e) => {
      this.currentWeekStart = e.detail.date;
      this.updateComponents();
    });
  }

  updateComponents() {
    this.header.setState({ currentWeekStart: this.currentWeekStart });
    this.grid.setState({ currentWeekStart: this.currentWeekStart });
  }

  updateTodayTasks() {
    const todayContainer = document.querySelector(".today-tasks");
    if (!todayContainer) return;

    const todayTasks = this.taskService.getTodayTasks();
    todayContainer.innerHTML = todayTasks
      .map((task) => {
        const taskDate = new Date(task.date);
        return `
          <article class="sidebar-task-preview" data-task='${JSON.stringify(
            task
          )}'>
            <h4 class="task-title">${task.title}</h4>
            <time class="task-time" datetime="${taskDate.toISOString()}">
              ${formatTime(task.date)}
            </time>
          </article>
        `;
      })
      .join("");

    console.log("Calendar initializing with container:", this.container);

    todayContainer.addEventListener("click", (e) => {
      const taskPreview = e.target.closest(".sidebar-task-preview");
      if (taskPreview) {
        const task = JSON.parse(taskPreview.dataset.task);
        document.dispatchEvent(
          new CustomEvent("openTaskDetails", { detail: { task } })
        );
      }
    });
  }

  navigateToDate(date) {
    this.currentWeekStart = getWeekStart(date);
    this.updateComponents();
  }
}
