// src/js/components/events/EventModal.js
import EventService from "../../services/EventService.js";

export class EventModal {
  constructor(eventService) {
    this.eventService = eventService;
    this.modal = document.getElementById("eventModal");
    this.eventsView = document.getElementById("events-view");
    this.addEventForm = document.getElementById("add-event-form");
    this.modalDate = document.getElementById("modal-date");

    this.initialize();
  }

  initialize() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Open modal event
    document.addEventListener("openEventModal", (e) => {
      const { date, hour } = e.detail;
      this.openEventModal(date, hour);
    });

    // Open event details event
    document.addEventListener("openEventDetails", (e) => {
      const { event } = e.detail;
      this.openEventDetails(event);
    });

    // Form submission
    const eventForm = document.getElementById("event-form");
    if (eventForm) {
      eventForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        await this.handleEventSubmit();
        this.closeModal();
      });
    }

    // Delete button
    const deleteButton = document.querySelector(".delete-event");
    if (deleteButton) {
      deleteButton.addEventListener("click", (e) => {
        const eventId = e.target.dataset.eventId;
        if (eventId && confirm("Are you sure you want to delete this event?")) {
          this.eventService
            .deleteEvent(eventId)
            .then(() => {
              this.closeModal();
            })
            .catch(() => {
              alert("Failed to delete event. Please try again.");
            });
        }
      });
    }

    // Priority and Reminder buttons
    document.addEventListener("click", (e) => {
      if (e.target.closest(".priority-btn")) {
        const btn = e.target.closest(".priority-btn");
        const container = btn.closest(".priority-buttons");
        if (container) {
          container.querySelectorAll(".priority-btn").forEach((b) => {
            b.classList.remove("selected");
          });
          btn.classList.add("selected");
        }
      }

      if (e.target.closest(".reminder-btn")) {
        const btn = e.target.closest(".reminder-btn");
        const container = btn.closest(".reminder-buttons");
        if (container) {
          container.querySelectorAll(".reminder-btn").forEach((b) => {
            b.classList.remove("selected");
          });
          btn.classList.add("selected");
        }
      }
    });

    // Tag input
    const tagInput = document.getElementById("tagInput");
    if (tagInput) {
      tagInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.addTag(e.target.value);
          e.target.value = "";
        }
      });
    }

    // Tag removal
    document.getElementById("selectedTags")?.addEventListener("click", (e) => {
      if (e.target.classList.contains("tag-remove")) {
        e.target.parentElement.remove();
      }
    });
  }

  async handleEventSubmit() {
    const form = document.getElementById("event-form");
    const formData = new FormData(form);

    const eventData = {
      title: formData.get("title"),
      date: new Date(formData.get("date") + "T" + formData.get("time")),
      description: formData.get("notes"),
      priority:
        document.querySelector(".priority-btn.selected")?.dataset.priority ||
        "low",
      reminder:
        document.querySelector(".reminder-btn.selected")?.dataset.time || null,
      tags: Array.from(document.querySelectorAll("#selectedTags .tag")).map(
        (tag) => tag.textContent.trim()
      ),
    };

    const eventId = form.dataset.eventId;
    try {
      if (eventId) {
        eventData.id = eventId;
        await this.eventService.editEvent(eventData);
      } else {
        await this.eventService.addEvent(eventData);
      }
    } catch (error) {
      console.error("Error saving event:", error);
      alert("Failed to save event. Please try again.");
    }
  }

  addTag(tagText) {
    if (!tagText.trim()) return;

    const tagsContainer = document.getElementById("selectedTags");
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.innerHTML = `
      ${tagText}
      <span class="tag-remove">&times;</span>
    `;
    tagsContainer.appendChild(tag);
  }

  openEventModal(date, hour) {
    this.updateModalDate(date, hour);
    this.resetForm();
    this.setupTimeInput(hour);
    this.setupEventForm(date);
    this.showEventForm();
    this.showModal();
  }

  setupTimeInput(hour) {
    const eventTimeInput = document.getElementById("eventTime");
    if (eventTimeInput) {
      const hourStr = hour.toString().padStart(2, "0");
      eventTimeInput.value = `${hourStr}:00`;
    }
  }

  setupEventForm(date) {
    this._currentDate = date;
  }

  showEventForm() {
    this.eventsView.classList.add("hidden");
    this.addEventForm.classList.remove("hidden");
  }

  showEventDetails(event) {
    this.eventsView.classList.remove("hidden");
    this.addEventForm.classList.add("hidden");
  }

  resetForm() {
    document.getElementById("title").value = "";
    document.getElementById("notes").value = "";
    document.getElementById("selectedTags").innerHTML = "";

    const priorityContainer = document.querySelector(".priority-buttons");
    priorityContainer?.querySelectorAll(".priority-btn").forEach((btn) => {
      btn.classList.remove("selected");
    });

    const reminderContainer = document.querySelector(".reminder-buttons");
    reminderContainer?.querySelectorAll(".reminder-btn").forEach((btn) => {
      btn.classList.remove("selected");
    });
  }

  updateModalDate(date, hour) {
    let period = "AM";
    let displayHour = hour;
    if (hour >= 12) {
      period = "PM";
      displayHour = hour === 12 ? 12 : hour - 12;
    }
    if (hour === 0) {
      displayHour = 12;
    }
    const timeStr = `${displayHour}:00 ${period}`;
    this.modalDate.textContent = `${date.toDateString()} at ${timeStr}`;
  }

  showModal() {
    this.modal.classList.add("show");
    this.modal.setAttribute("aria-hidden", "false");
  }

  closeModal() {
    this.modal.classList.remove("show");
    this.modal.setAttribute("aria-hidden", "true");
  }
}

export default EventModal;
