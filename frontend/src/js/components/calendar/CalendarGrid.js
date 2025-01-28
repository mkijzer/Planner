// src/js/components/calendar/CalendarGrid.js
import { Component } from "../Component.js";
import {
  isToday,
  generateTimeSlots,
  getHourFromTimeSlot,
  formatTime,
} from "../../modules/calendar/DateUtils.js";

export class CalendarGrid extends Component {
  constructor(container, taskService) {
    super(container);
    this.taskService = taskService;
    this.timeSlots = generateTimeSlots();
    this.currentWeekStart = null;
  }

  setState(newState) {
    super.setState(newState);
    if (newState.currentWeekStart) {
      this.currentWeekStart = new Date(newState.currentWeekStart); // Ensure proper date object
      this.render(); // Make sure render is called
    }
  }

  render() {
    if (!this.currentWeekStart) return;

    // Start with time column
    let calendarHTML = '<div class="time-column">';
    this.timeSlots.forEach((timeSlot) => {
      calendarHTML += `<div class="time-slot">${timeSlot}</div>`;
    });
    calendarHTML += "</div>";

    // Generate columns for each day
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(this.currentWeekStart);
      currentDate.setDate(currentDate.getDate() + i);
      const dayName = currentDate.toLocaleString("en-US", { weekday: "short" });
      const dayNum = currentDate.getDate();

      calendarHTML += `
        <div class="day-column ${isToday(currentDate) ? "current-day" : ""}">
          <div class="day-header">${dayName} ${dayNum}</div>
          ${this.generateTimeSlotCells(currentDate)}
        </div>
      `;
    }

    this.container.innerHTML = calendarHTML;
  }

  setupEventListeners() {
    this.container.addEventListener("click", (e) => {
      if (e.target.closest(".task-preview")) {
        const taskPreview = e.target.closest(".task-preview");
        const task = JSON.parse(taskPreview.dataset.task);
        document.dispatchEvent(
          new CustomEvent("openTaskDetails", { detail: { task } })
        );
      } else if (e.target.classList.contains("time-cell")) {
        const cell = e.target;
        const date = new Date(cell.dataset.date);
        const hour = parseInt(cell.dataset.hour);
        document.dispatchEvent(
          new CustomEvent("openTaskModal", { detail: { date, hour } })
        );
      }
    });
  }

  generateTaskPreview(task) {
    const taskDate = new Date(task.date);
    return `
      <article class="task-preview" 
           data-task-id="${task.id}"
           data-task='${JSON.stringify(task)}'>
          <div class="task-content">
            <h4 class="task-title">${task.title}</h4>
            <time class="task-time" datetime="${taskDate.toISOString()}">
              ${formatTime(task.date)}
            </time>
          </div>
          <div class="task-preview-priority ${task.priority}" 
               aria-label="Priority: ${task.priority}">
          </div>
      </article>
    `;
  }

  generateTimeSlotCells(date) {
    return this.timeSlots
      .map((_, index) => {
        const hour = getHourFromTimeSlot(index);
        const isNextDay = index >= 18;
        const cellDate = new Date(date);
        if (isNextDay) {
          cellDate.setDate(cellDate.getDate() + 1);
        }
        cellDate.setHours(hour, 0, 0, 0);

        const tasks = this.taskService.getTasksForTimeSlot(cellDate, hour);
        const taskHTML = tasks
          .map((task) => this.generateTaskPreview(task))
          .join("");

        return `
          <div class="time-cell" data-date="${cellDate.toISOString()}" data-hour="${hour}">
            ${taskHTML}
          </div>
        `;
      })
      .join("");
  }
}
