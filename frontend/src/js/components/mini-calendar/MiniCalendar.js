// src/js/components/mini-calendar/MiniCalendar.js
import { Component } from "../../components/Component.js";

export class MiniCalendar extends Component {
  constructor(container, calendar, eventService) {
    // Add eventService parameter
    const initialState = {
      currentDate: new Date(),
      selectedDate: new Date(),
      events: [], // Add events to state
    };

    super(container, initialState);
    this.calendar = calendar;
    this.eventService = eventService; // Store eventService
    this.loadEvents(); // Load events when component is created
  }

  async loadEvents() {
    try {
      const events = await this.eventService.getAllEvents();
      this.setState({ events: events });
    } catch (error) {
      console.error("Error loading events:", error);
    }
  }

  // Add method to get events for a specific date
  getEventsForDate(date) {
    return this.state.events.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  }

  // Add method to check if date has events
  hasEvents(date) {
    return this.state.events.some((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  }

  render() {
    const year = this.state.currentDate.getFullYear();
    const month = this.state.currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const firstDayIndex = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const nextDays = 42 - (firstDayIndex + daysInMonth);

    let html = `
   <header class="mini-calendar-header">
     <button class="mini-prev-month" aria-label="Previous month">&lt;</button>
     <time datetime="${firstDay.toISOString().slice(0, 7)}">
       ${firstDay.toLocaleString("default", {
         month: "long",
         year: "numeric",
       })}
     </time>
     <button class="mini-next-month" aria-label="Next month">&gt;</button>
   </header>
   <div class="mini-calendar-days" role="grid">
     <div class="columnheade" role="columnheader">Su</div>
     <div class="columnheade"role="columnheader">Mo</div>
     <div class="columnheade"role="columnheader">Tu</div>
     <div class="columnheade" role="columnheader">We</div>
     <div class="columnheade"role="columnheader">Th</div>
     <div class="columnheade"role="columnheader">Fr</div>
     <div class="columnheade"role="columnheader">Sa</div>
   `;

    // Previous month days
    for (let i = firstDayIndex; i > 0; i--) {
      const prevDate = new Date(year, month, -i + 1);
      html += `
       <time 
         class="mini-calendar-day prev-month" 
         datetime="${prevDate.toISOString().slice(0, 10)}"
         aria-label="${prevDate.toLocaleDateString()}"
       >${prevDate.getDate()}</time>`;
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = this.isToday(date);
      const isSelected = this.isSelected(date);
      const hasEvents = this.hasEvents(date);

      html += `
          <time 
              class="mini-calendar-day${isToday ? " today" : ""}${
        isSelected ? " selected" : ""
      }"
              datetime="${date.toISOString().slice(0, 10)}"
              aria-label="${date.toLocaleDateString()}"
              data-date="${date.toISOString()}"
          >
              ${day}
              ${hasEvents ? '<span class="event-dot"></span>' : ""}
          </time>`;
    }

    // Next month days
    for (let i = 1; i <= nextDays; i++) {
      const nextDate = new Date(year, month + 1, i);
      html += `
     <time 
       class="mini-calendar-day next-month"
       datetime="${nextDate.toISOString().slice(0, 10)}"
       aria-label="${nextDate.toLocaleDateString()}"
     >${nextDate.getDate()}</time>`;
    }

    html += "</div>";
    this.container.innerHTML = html;

    const todayElement = this.container.querySelector(
      ".mini-calendar-day.today"
    );
    if (todayElement) {
      todayElement.classList.add("animate");
      todayElement.addEventListener("animationend", function () {
        this.classList.remove("animate");
      });
    }
  }

  setupEventListeners() {
    this.container.addEventListener("click", (e) => {
      if (e.target.closest(".mini-prev-month")) {
        e.stopPropagation();
        const newDate = new Date(this.state.currentDate);
        newDate.setMonth(newDate.getMonth() - 1);
        this.setState({ currentDate: newDate });
      }

      if (e.target.closest(".mini-next-month")) {
        e.stopPropagation();
        const newDate = new Date(this.state.currentDate);
        newDate.setMonth(newDate.getMonth() + 1);
        this.setState({ currentDate: newDate });
      }

      const dayElement = e.target.closest(".mini-calendar-day");
      if (dayElement && dayElement.dataset.date) {
        const selectedDate = new Date(dayElement.dataset.date);
        this.setState({ selectedDate });
        this.calendar.navigateToDate(selectedDate);
      }
    });
  }

  isToday(date) {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  isSelected(date) {
    return (
      date.getDate() === this.state.selectedDate.getDate() &&
      date.getMonth() === this.state.selectedDate.getMonth() &&
      date.getFullYear() === this.state.selectedDate.getFullYear()
    );
  }
}
