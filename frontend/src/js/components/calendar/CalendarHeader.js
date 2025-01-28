// src/js/components/calendar/CalendarHeader.js
import { Component } from "../Component.js";

export class CalendarHeader extends Component {
  constructor(container) {
    super(container);
    this.currentWeekStart = new Date();
    this.state = {
      currentWeekStart: this.currentWeekStart,
    };
  }

  setState(newState) {
    super.setState(newState);
    if (newState.currentWeekStart) {
      this.currentWeekStart = new Date(newState.currentWeekStart);
      this.render();
    }
  }

  render() {
    if (!this.currentWeekStart) {
      this.currentWeekStart = new Date();
    }

    const weekEnd = new Date(this.currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    // Update the existing title instead of replacing the whole container
    const titleElement = this.container.querySelector(".month-nav-title");
    if (titleElement) {
      titleElement.textContent = `${this.currentWeekStart.toLocaleDateString(
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
  }

  setupEventListeners() {
    const prevButton = this.container.querySelector(".month-nav-prev");
    const nextButton = this.container.querySelector(".month-nav-next");

    prevButton?.addEventListener("click", () => {
      const newDate = new Date(this.currentWeekStart);
      newDate.setDate(newDate.getDate() - 7);
      document.dispatchEvent(
        new CustomEvent("weekChange", {
          detail: { date: newDate },
        })
      );
    });

    nextButton?.addEventListener("click", () => {
      const newDate = new Date(this.currentWeekStart);
      newDate.setDate(newDate.getDate() + 7);
      document.dispatchEvent(
        new CustomEvent("weekChange", {
          detail: { date: newDate },
        })
      );
    });
  }
}
