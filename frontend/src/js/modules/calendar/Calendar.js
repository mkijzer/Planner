// src/js/modules/calendar/Calendar.js
// At the top of Calendar.js, change from:
// import { getWeekStart, formatDayHeader, isToday, generateTimeSlots, getHourFromTimeSlot } from '../utils/DateUtils.js';
// to:
import {
  getWeekStart,
  formatDayHeader,
  isToday,
  generateTimeSlots,
  getHourFromTimeSlot,
} from "./DateUtils.js";

export class Calendar {
  constructor() {
    this.date = new Date();
    this.currentWeekStart = getWeekStart(this.date);
    this.tasks = [];
    this.timeSlots = generateTimeSlots();
    this.initialize();
  }

  initialize() {
    this.calendarGrid = document.querySelector(".calendar-grid-days");
    this.currentDateElement = document.querySelector(".month-nav-title");
    this.prevNextIcons = document.querySelectorAll(".month-nav button");

    this.generateCalendar();
    this.setupNavigation();
  }

  generateCalendar() {
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
                <div class="day-column ${
                  isToday(currentDate) ? "current-day" : ""
                }">
                    <div class="day-header">${dayName} ${dayNum}</div>
                    ${this.generateTimeSlotCells(currentDate)}
                </div>
            `;
    }

    this.calendarGrid.innerHTML = calendarHTML;
    this.updateTitle();
    this.setupCellClickListeners();
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

        const tasks = this.getTasksForTimeSlot(cellDate, hour);
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

  generateTaskPreview(task) {
    const taskTime = new Date(task.date);
    const hours = taskTime.getHours();
    const minutes = taskTime.getMinutes();
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const timeString = `${displayHours}:${minutes
      .toString()
      .padStart(2, "0")} ${period}`;

    return `
            <div class="task-preview" 
                 onclick="event.stopPropagation()" 
                 data-task-id="${task.title}"
                 data-task-date="${task.date}">
                <div>
                    <span class="task-title">${task.title}</span>
                    <span class="task-time">${timeString}</span>
                </div>
                <div class="task-preview-priority ${task.priority}"></div>
            </div>
        `;
  }

  updateTitle() {
    const weekEnd = new Date(this.currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    this.currentDateElement.textContent = `${this.currentWeekStart.toLocaleDateString(
      "en-US",
      {
        month: "long",
        day: "numeric",
      }
    )} - ${weekEnd.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })}`;
  }

  setupNavigation() {
    const prevButton = document.querySelector(".month-nav-prev");
    const nextButton = document.querySelector(".month-nav-next");

    prevButton?.addEventListener("click", () => {
      this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
      this.generateCalendar();
    });

    nextButton?.addEventListener("click", () => {
      this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);
      this.generateCalendar();
    });
  }

  setupCellClickListeners() {
    const cells = document.querySelectorAll(".time-cell");
    cells.forEach((cell) => {
      cell.addEventListener("click", () => {
        console.log("Cell clicked:", cell.dataset.date, cell.dataset.hour);
        const date = new Date(cell.dataset.date);
        const hour = parseInt(cell.dataset.hour);
        const event = new CustomEvent("openTaskModal", {
          detail: { date, hour },
        });
        document.dispatchEvent(event);
      });
    });
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

  addTask(taskData) {
    this.tasks.push(taskData);
    this.generateCalendar();
  }
}
