export class EventModal {
  constructor(eventManager) {
    this.eventManager = eventManager;
    this.modal = document.getElementById("eventModal");
    this.eventsView = document.getElementById("events-view");
    this.addEventForm = document.getElementById("add-event-form");
    this.modalDate = document.getElementById("modal-date");

    // Log elements found in constructor
    console.log("Modal elements on init:", {
      modal: this.modal,
      eventsView: this.eventsView,
      addEventForm: this.addEventForm,
    });

    this.initialize();
  }

  initialize() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    console.log("Setting up EventModal event listeners");

    // Open modal for new event
    document.addEventListener("openEventModal", (e) => {
      console.log("openEventModal event received:", e.detail);
      const { date, hour } = e.detail;
      this.openEventModal(date, hour);
    });

    // Open existing event details
    document.addEventListener("openEventDetails", (e) => {
      console.log("openEventDetails event received:", e.detail);
      const { event } = e.detail;
      if (event) {
        this.openEventDetails(event);
      } else {
        console.log("No event data in openEventDetails event");
      }
    });

    // Edit button
    const editButton = document.querySelector(".edit-event");
    if (editButton) {
      editButton.addEventListener("click", (e) => {
        try {
          console.log("Edit button clicked, data:", e.target.dataset.event);
          const eventData = e.target.dataset.event;
          if (eventData) {
            // Replace HTML entities before parsing
            const decodedData = eventData
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
              .replace(/&amp;/g, "&");

            const event = JSON.parse(decodedData);
            console.log("Parsed event data for edit:", event);
            this.openEditForm(event);
          }
        } catch (error) {
          console.error("Error handling edit click:", error);
          console.error("Raw event data:", e.target.dataset.event);
        }
      });
    }

    // Delete button
    const deleteButton = document.querySelector(".delete-event");
    if (deleteButton) {
      deleteButton.addEventListener("click", async (e) => {
        const eventId = e.target.dataset.eventId;
        if (!eventId) {
          console.error("No event ID found for deletion");
          return;
        }

        try {
          // Single confirmation dialog
          if (window.confirm("Are you sure you want to delete this event?")) {
            console.log("Deleting event with ID:", eventId);
            await this.eventManager.deleteEvent(eventId);
            console.log("Event deleted successfully");
            this.closeModal();
            // No additional alerts needed
          }
        } catch (error) {
          console.error("Error deleting event:", error);
          // Single error alert
          window.alert("Failed to delete event. Please try again.");
        }
      });
    }

    // Form submission
    const eventForm = document.getElementById("event-form");
    eventForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleEventSubmit();
    });

    // Priority buttons
    document
      .querySelector(".priority-buttons")
      ?.addEventListener("click", (e) => {
        const btn = e.target.closest(".priority-btn");
        if (btn) {
          document
            .querySelectorAll(".priority-btn")
            .forEach((b) => b.classList.remove("selected"));
          btn.classList.add("selected");
        }
      });

    // Reminder buttons
    document
      .querySelector(".reminder-buttons")
      ?.addEventListener("click", (e) => {
        const btn = e.target.closest(".reminder-btn");
        if (btn) {
          document
            .querySelectorAll(".reminder-btn")
            .forEach((b) => b.classList.remove("selected"));
          btn.classList.add("selected");
        }
      });

    // Show event form button
    document
      .getElementById("show-event-form")
      ?.addEventListener("click", () => {
        this.showEventForm();
      });

    // Close modal button
    document.querySelector(".modal-close")?.addEventListener("click", () => {
      this.closeModal();
    });

    // Category/Tags
    const tagInput = document.getElementById("eventCategory");
    tagInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && tagInput.value.trim()) {
        e.preventDefault();
        this.addTag(tagInput.value.trim());
        tagInput.value = "";
      }
    });

    // Tag removal
    document.getElementById("selectedTags")?.addEventListener("click", (e) => {
      if (e.target.classList.contains("tag-remove")) {
        e.target.parentElement.remove();
      }
    });

    // Log all attached event listeners
    console.log("Event listeners attached to:", {
      modal: this.modal,
      eventsView: this.eventsView,
      addEventForm: this.addEventForm,
    });
  }

  openEditForm(event) {
    console.log("Opening edit form with event:", event); // Debug log

    // Show the form
    this.eventsView.classList.add("hidden");
    this.addEventForm.classList.remove("hidden");

    // Populate form
    this.populateFormWithEventData(event);

    // Update form submit button text
    const submitButton = document.querySelector(
      "#event-form button[type='submit']"
    );
    if (submitButton) {
      submitButton.textContent = "Update Event";
    }

    // Store event ID for update
    const form = document.getElementById("event-form");
    if (form) {
      form.dataset.eventId = event.id;
    }
  }

  populateFormWithEventData(event) {
    console.log("Populating form with event data:", event); // Debug log

    // Basic fields
    document.getElementById("eventTitle").value = event.title || "";
    document.getElementById("eventNotes").value = event.description || "";

    // Date and time
    const eventDate = new Date(event.date);
    document.getElementById("eventDate").value = eventDate
      .toISOString()
      .split("T")[0];
    document.getElementById("eventTime").value = eventDate
      .toTimeString()
      .slice(0, 5);

    // Priority
    document.querySelectorAll(".priority-btn").forEach((btn) => {
      btn.classList.remove("selected");
      if (btn.dataset.priority === event.priority) {
        btn.classList.add("selected");
      }
    });

    // Reminder
    document.querySelectorAll(".reminder-btn").forEach((btn) => {
      btn.classList.remove("selected");
      if (btn.dataset.time === event.reminder) {
        btn.classList.add("selected");
      }
    });

    // Tags
    const tagsContainer = document.getElementById("selectedTags");
    tagsContainer.innerHTML = "";
    if (event.tags && Array.isArray(event.tags)) {
      event.tags.forEach((tag) => this.addTag(tag));
    }
  }

  openEventModal(date, hour) {
    console.log("Opening event modal with:", { date, hour });

    if (!this.modal || !this.eventsView || !this.addEventForm) {
      console.error("Required modal elements not found:", {
        modal: this.modal,
        eventsView: this.eventsView,
        addEventForm: this.addEventForm,
      });
      return;
    }

    // Show the form view
    this.eventsView.classList.add("hidden");
    this.addEventForm.classList.remove("hidden");

    // Set the date and time in the form
    const eventDate = document.getElementById("eventDate");
    const eventTime = document.getElementById("eventTime");

    console.log("Form elements:", { eventDate, eventTime });

    if (eventDate) eventDate.value = date;
    if (eventTime) {
      const timeString = `${hour.toString().padStart(2, "0")}:00`;
      eventTime.value = timeString;
    }

    this.showModal();
    console.log("Modal opened successfully");
  }

  openEventDetails(event) {
    try {
      let eventData = event;
      if (typeof event === "string") {
        // Handle both encoded and non-encoded strings
        const decodedEvent = event.includes("%")
          ? decodeURIComponent(event)
          : event;
        eventData = JSON.parse(decodedEvent);
      }

      console.log("Processing event details:", eventData);

      // Update modal title
      const modalHeading = document.getElementById("modal-heading");
      if (modalHeading) {
        modalHeading.textContent = eventData.title;
      }

      // Show event details view
      this.eventsView.classList.remove("hidden");
      this.addEventForm.classList.add("hidden");

      // Update event details
      const eventDetails = document.querySelector(".event-details");
      if (eventDetails) {
        // Update each field
        const updateElement = (selector, value) => {
          const element = eventDetails.querySelector(selector);
          if (element) {
            element.textContent = value;
          }
        };

        // Set all the event details
        updateElement(".notes-value", eventData.description || "");
        updateElement(
          ".category-value",
          eventData.tags ? eventData.tags.join(", ") : ""
        );

        const eventDate = new Date(eventData.date);
        updateElement(
          ".date-value",
          eventDate.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        );
        updateElement(".time-value", this.getTimeString(eventData.date));

        // Update priority
        const priorityIndicator = eventDetails.querySelector(
          ".priority-indicator"
        );
        const priorityValue = eventDetails.querySelector(".priority-value");
        if (priorityIndicator && priorityValue) {
          priorityIndicator.className = `priority-indicator ${
            eventData.priority || "low"
          }`;
          priorityValue.textContent = eventData.priority || "low";
        }

        // Update reminder
        updateElement(
          ".reminder-value",
          eventData.reminder ? `${eventData.reminder} min.` : "None"
        );

        // Set up edit and delete buttons
        const editButton = document.querySelector(".edit-event");
        const deleteButton = document.querySelector(".delete-event");

        if (editButton) {
          const safeEventData = {
            ...eventData,
            date: eventData.date.toString(),
          };
          // Store as a regular JSON string
          editButton.dataset.event = JSON.stringify(safeEventData);
        }

        if (deleteButton) {
          deleteButton.dataset.eventId = eventData.id;
        }
      }

      this.showModal();
    } catch (error) {
      console.error("Error opening event details:", error);
      console.error("Original event data:", event);
    }
  }

  setupDateInput(date) {
    const eventDateInput = document.getElementById("eventDate");
    if (eventDateInput) {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      eventDateInput.value = `${year}-${month}-${day}`;
    }
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

  handleEventSubmit() {
    const eventTitle = document.getElementById("eventTitle").value;
    if (!eventTitle.trim()) return;

    const eventDateInput = document.getElementById("eventDate");
    const eventDate = new Date(eventDateInput.value);

    const timeInput = document.getElementById("eventTime");
    const [hours, minutes] = timeInput.value.split(":").map(Number);
    eventDate.setHours(hours, minutes, 0, 0);

    const eventData = {
      id: Date.now().toString(),
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

    this.eventManager.addEvent(eventData);
    this.closeModal();
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
      form.dataset.eventId = "";
    }

    // Reset all buttons and selections
    document
      .querySelectorAll(".priority-btn, .reminder-btn")
      .forEach((btn) => btn.classList.remove("selected"));

    const selectedTags = document.getElementById("selectedTags");
    if (selectedTags) {
      selectedTags.innerHTML = "";
    }

    // Clear delete button data
    const deleteButton = document.querySelector(".delete-event");
    if (deleteButton) {
      deleteButton.dataset.eventId = "";
    }
  }

  showModal() {
    this.modal.classList.add("show");
    this.modal.setAttribute("aria-hidden", "false");
  }

  closeModal() {
    if (this.modal) {
      this.modal.classList.remove("show");
      this.modal.setAttribute("aria-hidden", "true");
      this.resetForm();
    }
  }

  getTimeString(date) {
    const eventDate = new Date(date);
    const hours = eventDate.getHours();
    const minutes = eventDate.getMinutes();
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  }

  addTag(tagValue) {
    const tagsContainer = document.getElementById("selectedTags");
    tagsContainer.innerHTML += `
      <span class="tag" data-value="${tagValue}">
        ${tagValue}
        <span class="tag-remove">&times;</span>
      </span>
    `;
  }
}
