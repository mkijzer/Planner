import { formatTime } from "../../modules/calendar/DateUtils.js";

export class EventModal {
  constructor(eventManager) {
    this.eventManager = eventManager;
    this.modal = document.getElementById("eventModal");
    this.eventsView = document.getElementById("events-view");
    this.addEventForm = document.getElementById("add-event-form");

    // Update element references to match new HTML
    this.modalHeading = document.getElementById("modal-heading");
    this.eventDateEl = document.getElementById("event-date");
    this.eventTimeEl = document.getElementById("event-time");
    this.eventReminder = document.getElementById("event-reminder");
    this.eventNotes = document.getElementById("event-notes");

    if (!this.modal || !this.eventsView || !this.addEventForm) {
      console.error("Required modal elements not found");
      return;
    }

    this.initialize();
  }

  initialize() {
    this.setupEventListeners();
    this.setupFormHandlers();
    this.setupModalClose();
  }

  setupEventListeners() {
    document.addEventListener("openEventModal", (e) => {
      const { date, hour } = e.detail;
      this.openEventModal(date, hour);
    });

    document.addEventListener("editEvent", (e) => {
      const { event } = e.detail;
      this.openEditForm(event);
    });

    document.addEventListener("deleteEvent", (e) => {
      const { eventId } = e.detail;
      if (confirm("Are you sure you want to delete this event?")) {
        this.eventManager.deleteEvent(eventId);
        this.closeModal();
      }
    });

    document.addEventListener("openEventDetails", (e) => {
      const { event } = e.detail;
      this.openEventDetails(event);
    });

    document
      .getElementById("show-event-form")
      ?.addEventListener("click", () => {
        this.showEventForm();
      });

    const eventForm = document.getElementById("event-form");
    if (eventForm) {
      eventForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleEventSubmit();
      });
    }
  }

  setupFormHandlers() {
    const priorityContainer = document.querySelector(".priority-buttons");
    if (priorityContainer) {
      priorityContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".priority-btn");
        if (btn) {
          priorityContainer
            .querySelectorAll(".priority-btn")
            .forEach((b) => b.classList.remove("selected"));
          btn.classList.add("selected");
        }
      });
    }

    const reminderContainer = document.querySelector(".reminder-buttons");
    if (reminderContainer) {
      reminderContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".reminder-btn");
        if (btn) {
          reminderContainer
            .querySelectorAll(".reminder-btn")
            .forEach((b) => b.classList.remove("selected"));
          btn.classList.add("selected");
        }
      });
    }

    const tagInput = document.getElementById("eventCategory");
    tagInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && tagInput.value.trim()) {
        e.preventDefault();
        this.addTag(tagInput.value.trim());
        tagInput.value = "";
      }
    });

    document.getElementById("selectedTags")?.addEventListener("click", (e) => {
      if (e.target.classList.contains("tag-remove")) {
        e.target.parentElement.remove();
      }
    });
  }

  setupModalClose() {
    const modalCloseButton = this.modal.querySelector(".modal-close");
    if (modalCloseButton) {
      modalCloseButton.addEventListener("click", () => {
        this.closeModal();
      });
    }
  }

  showModal() {
    this.modal.classList.add("show");
    this.modal.setAttribute("aria-hidden", "false");
  }

  closeModal() {
    this.modal.classList.remove("show");
    this.modal.setAttribute("aria-hidden", "true");
    this.resetForm();
  }

  showEventForm() {
    this.eventsView.classList.add("hidden");
    this.addEventForm.classList.remove("hidden");
  }

  showEventDetails() {
    this.eventsView.classList.remove("hidden");
    this.addEventForm.classList.add("hidden");
  }

  resetForm() {
    const form = document.getElementById("event-form");
    if (form) {
      form.reset();
      document.getElementById("selectedTags").innerHTML = "";
      document
        .querySelectorAll(".priority-btn, .reminder-btn")
        .forEach((btn) => btn.classList.remove("selected"));
    }
  }

  openEventModal(date, hour) {
    this._currentDate = date;
    this.resetForm();

    const eventTimeInput = document.getElementById("eventTime");
    if (eventTimeInput) {
      const hourStr = hour.toString().padStart(2, "0");
      eventTimeInput.value = `${hourStr}:00`;
    }

    if (this.eventDateEl) {
      this.eventDateEl.textContent = this.formatDate(date);
    }
    if (this.eventTimeEl) {
      this.eventTimeEl.textContent = formatTime(
        new Date().setHours(hour, 0, 0)
      );
    }

    this.showEventForm();
    this.showModal();
  }

  openEventDetails(event) {
    if (this.modalHeading) {
      this.modalHeading.textContent = event.title;
    }

    const date = new Date(event.date);

    if (this.eventDateEl) {
      this.eventDateEl.textContent = this.formatDate(date);
    }
    if (this.eventTimeEl) {
      this.eventTimeEl.textContent = formatTime(event.date);
    }
    if (this.eventNotes) {
      this.eventNotes.textContent = event.notes || "No notes added";
    }

    // Setup edit/delete buttons
    const editBtn = this.modal.querySelector(".edit-btn");
    const deleteBtn = this.modal.querySelector(".delete-btn");

    editBtn?.addEventListener("click", () => this.openEditForm(event));
    deleteBtn?.addEventListener("click", () => {
      if (confirm("Are you sure you want to delete this event?")) {
        this.eventManager.deleteEvent(event.id);
        this.closeModal();
      }
    });

    this.showEventDetails();
    this.showModal();
  }

  openEditForm(event) {
    // Store current event data for editing
    this._currentEventId = event.id;
    this._currentDate = new Date(event.date);

    // Update modal header
    if (this.modalHeading) {
      this.modalHeading.textContent = "Edit Event";
    }

    // Populate form with event data
    document.getElementById("eventTitle").value = event.title;
    document.getElementById("eventTime").value = new Date(event.date)
      .toTimeString()
      .slice(0, 5);
    document.getElementById("eventNotes").value = event.notes || "";

    // Set priority
    if (event.priority) {
      document
        .querySelector(`.priority-btn[data-priority="${event.priority}"]`)
        ?.classList.add("selected");
    }

    // Set reminder
    if (event.reminder) {
      document
        .querySelector(`.reminder-btn[data-time="${event.reminder}"]`)
        ?.classList.add("selected");
    }

    // Set tags
    const tagsContainer = document.getElementById("selectedTags");
    tagsContainer.innerHTML = "";
    event.tags?.forEach((tag) => this.addTag(tag));

    // Update form submission handler for edit mode
    const eventForm = document.getElementById("event-form");
    if (eventForm) {
      eventForm.onsubmit = (e) => {
        e.preventDefault();
        this.handleEditSubmit(this._currentEventId);
      };
    }

    // Show form
    this.showEventForm();
    this.showModal();
  }

  handleEventSubmit() {
    const eventTitle = document.getElementById("eventTitle").value;
    if (!eventTitle.trim()) return;

    const eventData = {
      id: Date.now().toString(),
      title: eventTitle,
      date: new Date(this._currentDate),
      priority:
        document.querySelector(".priority-btn.selected")?.dataset.priority ||
        "low",
      reminder: document.querySelector(".reminder-btn.selected")?.dataset.time,
      notes: document.getElementById("eventNotes").value,
      tags: Array.from(document.querySelectorAll(".tag")).map(
        (tag) => tag.dataset.value
      ),
    };

    const timeInput = document.getElementById("eventTime");
    if (timeInput?.value) {
      const [hours, minutes] = timeInput.value.split(":").map(Number);
      eventData.date.setHours(hours, minutes);
    }

    this.eventManager.addEvent(eventData);
    this.closeModal();
  }

  handleEditSubmit(eventId) {
    const eventTitle = document.getElementById("eventTitle").value;
    if (!eventTitle.trim()) return;

    const eventDate = new Date(this._currentDate);
    const timeInput = document.getElementById("eventTime");
    if (timeInput?.value) {
      const [hours, minutes] = timeInput.value.split(":").map(Number);
      eventDate.setHours(hours, minutes);
    }

    const eventData = {
      id: eventId,
      title: eventTitle,
      date: eventDate,
      priority:
        document.querySelector(".priority-btn.selected")?.dataset.priority ||
        "low",
      reminder: document.querySelector(".reminder-btn.selected")?.dataset.time,
      notes: document.getElementById("eventNotes").value,
      tags: Array.from(document.querySelectorAll(".tag")).map(
        (tag) => tag.dataset.value
      ),
    };

    this.eventManager.updateEvent(eventId, eventData);
    this.closeModal();
  }

  formatDate(date) {
    // Detect the user's locale
    const userLocale = navigator.language || "en-US"; // Use 'en-US' as a fallback

    const options = { year: "numeric", month: "long", day: "numeric" };
    const formattedDate = new Date(date).toLocaleDateString(
      userLocale,
      options
    );

    const weekday = new Date(date).toLocaleDateString(userLocale, {
      weekday: "long",
    });

    return `${formattedDate} (${weekday})`;
  }

  addTag(tag) {
    const tagContainer = document.getElementById("selectedTags");
    const tagElement = document.createElement("span");
    tagElement.classList.add("tag");
    tagElement.dataset.value = tag;
    tagElement.textContent = tag;

    const removeBtn = document.createElement("span");
    removeBtn.classList.add("tag-remove");
    removeBtn.textContent = "×";
    removeBtn.addEventListener("click", () => tagElement.remove());
    tagElement.appendChild(removeBtn);

    tagContainer.appendChild(tagElement);
  }
}
