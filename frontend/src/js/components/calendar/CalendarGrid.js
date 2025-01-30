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
    this.scrollTimeout = null;
    this.isAutoScrolling = false;
    this.isModalOpen = false;

    // Setup global event listeners once
    this.setupGlobalEventListeners();
  }

  setState(newState) {
    super.setState(newState);
    if (newState.currentWeekStart) {
      this.currentWeekStart = new Date(newState.currentWeekStart);
      this.render();
    }
  }

  setupGlobalEventListeners() {
    // Modal state listeners
    document.addEventListener("openTaskModal", () => {
      this.isModalOpen = true;
      // Clear any pending scroll timeouts when modal opens
      if (this.scrollTimeout) {
        clearTimeout(this.scrollTimeout);
      }
    });

    document.addEventListener("closeTaskModal", () => {
      this.isModalOpen = false;
      // Start the scroll timeout again after modal closes
      this.startScrollTimeout();
    });

    document.addEventListener("taskSaved", () => {
      this.isModalOpen = false;
      setTimeout(() => {
        this.scrollToCurrentTime();
      }, 500);
    });

    document.addEventListener("taskDeleted", () => {
      this.isModalOpen = false;
      setTimeout(() => {
        this.scrollToCurrentTime();
      }, 500);
    });
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
                <div class="day-column ${
                  isToday(currentDate) ? "current-day" : ""
                }">
                    <div class="day-header">${dayName} ${dayNum}</div>
                    ${this.generateTimeSlotCells(currentDate)}
                </div>
            `;
    }

    this.container.innerHTML = calendarHTML;

    // Setup scroll behavior after rendering
    this.setupScrollListener();
    if (!this.isModalOpen) {
      setTimeout(() => {
        this.scrollToCurrentTime();
      }, 100);
    }
  }

  startScrollTimeout() {
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    if (!this.isAutoScrolling && !this.isModalOpen) {
      this.scrollTimeout = setTimeout(() => {
        this.scrollToCurrentTime();
      }, 2000);
    }
  }

  setupScrollListener() {
    this.container.addEventListener("scroll", () => {
      if (!this.isModalOpen) {
        this.startScrollTimeout();
      }
    });
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

  scrollToCurrentTime() {
    this.isAutoScrolling = true;
    const now = new Date();
    const currentHour = now.getHours();

    // Find the current time slot in the current day column
    const todayColumn = this.container.querySelector(".current-day");
    if (todayColumn) {
      const timeSlot = todayColumn.querySelector(
        `[data-hour="${currentHour}"]`
      );
      if (timeSlot) {
        timeSlot.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }

    // Reset flag after scrolling
    setTimeout(() => {
      this.isAutoScrolling = false;
    }, 1000);
  }

  generateTaskPreview(task) {
    const taskDate = new Date(task.date);
    const now = new Date();

    // Determine task timing
    let taskTiming = "future";
    if (taskDate < now) {
      taskTiming = "past";
    } else if (taskDate <= new Date(now.getTime() + 3 * 3600000)) {
      // Next 3 hours
      taskTiming = "current";
    }

    return `
        <article class="task-preview ${taskTiming}" 
                data-task-id="${task.id}" 
                data-task='${JSON.stringify(task)}'>
            <div class="task-content">
                <div class="task-title">${task.title}</div>
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
