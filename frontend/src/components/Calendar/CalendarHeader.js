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

    // Format the date string as "Month Year" on top and "Start Day - End Day" below
    const monthYear = this.currentWeekStart.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    const startDay = this.currentWeekStart.toLocaleDateString("en-US", {
      day: "numeric",
    });

    const endDay = weekEnd.toLocaleDateString("en-US", {
      day: "numeric",
    });

    // Update the existing title instead of replacing the whole container
    const titleElement = this.container.querySelector(".month-nav-title");
    if (titleElement) {
      titleElement.innerHTML = `
        <div>${monthYear}</div>
        <div>${startDay} - ${endDay}</div>
      `;
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
