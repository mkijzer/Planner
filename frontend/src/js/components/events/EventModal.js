/**
 * EventModal Component
 *
 * Handles all modal operations for events:
 * - Creating new events from calendar time slots
 * - Viewing existing event details
 * - Editing event information
 * - Deleting events with confirmation
 *
 * Features:
 * - Form validation and user feedback
 * - Tag management system
 * - Priority and reminder selection
 * - Proper event listener management to prevent duplicates
 */

import { formatTime } from "../../modules/calendar/DateUtils.js";

export class EventModal {
  /**
   * Create EventModal instance
   * @param {EventManager} eventManager - Service for event CRUD operations
   */
  constructor(eventManager) {
    this.eventManager = eventManager;

    // Get modal DOM elements
    this.modal = document.getElementById("eventModal");
    this.eventsView = document.getElementById("events-view");
    this.addEventForm = document.getElementById("add-event-form");

    // Get display elements for event details
    this.modalHeading = document.getElementById("modal-heading");
    this.eventDateEl = document.getElementById("event-date");
    this.eventTimeEl = document.getElementById("event-time");
    this.eventReminder = document.getElementById("event-reminder");
    this.eventNotes = document.getElementById("event-notes");

    // Validate required elements exist
    if (!this.modal || !this.eventsView || !this.addEventForm) {
      console.error("Required modal elements not found");
      return;
    }

    this.initialize();
  }

  /**
   * Initialize modal with all event listeners and handlers
   */
  initialize() {
    this.setupEventListeners();
    this.setupFormHandlers();
    this.setupModalClose();
  }

  /**
   * Set up document-level event listeners for modal operations
   * Listens for custom events dispatched from other components
   */
  setupEventListeners() {
    // Listen for request to open new event modal
    document.addEventListener("openEventModal", (e) => {
      const { date, hour } = e.detail;
      this.openEventModal(date, hour);
    });

    // Listen for edit event requests (currently unused)
    document.addEventListener("editEvent", (e) => {
      const { event } = e.detail;
      this.openEditForm(event);
    });

    // Listen for delete event requests (currently unused)
    document.addEventListener("deleteEvent", (e) => {
      const { eventId } = e.detail;
      if (confirm("Are you sure you want to delete this event?")) {
        this.eventManager.deleteEvent(eventId);
        this.closeModal();
      }
    });

    // Listen for request to view event details
    document.addEventListener("openEventDetails", (e) => {
      const { event } = e.detail;
      this.openEventDetails(event);
    });

    // Handle "Add New Event" button click from details view
    document
      .getElementById("show-event-form")
      ?.addEventListener("click", () => {
        this.showEventForm();
      });

    // Handle form submission for new events
    const eventForm = document.getElementById("event-form");
    if (eventForm) {
      eventForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleEventSubmit();
      });
    }
  }

  /**
   * Set up form-specific event handlers for interactive elements
   */
  setupFormHandlers() {
    // Priority button selection handler
    const priorityContainer = document.querySelector(".priority-buttons");
    if (priorityContainer) {
      priorityContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".priority-btn");
        if (btn) {
          // Clear previous selections
          priorityContainer
            .querySelectorAll(".priority-btn")
            .forEach((b) => b.classList.remove("selected"));
          // Set new selection
          btn.classList.add("selected");
        }
      });
    }

    // Reminder time selection handler
    const reminderContainer = document.querySelector(".reminder-buttons");
    if (reminderContainer) {
      reminderContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".reminder-btn");
        if (btn) {
          // Clear previous selections
          reminderContainer
            .querySelectorAll(".reminder-btn")
            .forEach((b) => b.classList.remove("selected"));
          // Set new selection
          btn.classList.add("selected");
        }
      });
    }

    // Tag input handler - add tag on Enter key
    const tagInput = document.getElementById("eventCategory");
    tagInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && tagInput.value.trim()) {
        e.preventDefault();
        this.addTag(tagInput.value.trim());
        tagInput.value = "";
      }
    });

    // Tag removal handler - remove tag when X is clicked
    document.getElementById("selectedTags")?.addEventListener("click", (e) => {
      if (e.target.classList.contains("tag-remove")) {
        e.target.parentElement.remove();
      }
    });
  }

  /**
   * Set up modal close functionality
   */
  setupModalClose() {
    const modalCloseButton = this.modal.querySelector(".modal-close");
    if (modalCloseButton) {
      modalCloseButton.addEventListener("click", () => {
        this.closeModal();
      });
    }
  }

  /**
   * Show the modal with proper accessibility attributes
   */
  showModal() {
    this.modal.classList.add("show");
    this.modal.setAttribute("aria-hidden", "false");
  }

  /**
   * Close the modal and reset form state
   */
  closeModal() {
    this.modal.classList.remove("show");
    this.modal.setAttribute("aria-hidden", "true");
    this.resetForm();
  }

  /**
   * Switch modal to show event creation/edit form
   */
  showEventForm() {
    this.eventsView.classList.add("hidden");
    this.addEventForm.classList.remove("hidden");
  }

  /**
   * Switch modal to show event details view
   */
  showEventDetails() {
    this.eventsView.classList.remove("hidden");
    this.addEventForm.classList.add("hidden");
  }

  /**
   * Reset form to initial state and clear all inputs
   */
  resetForm() {
    const form = document.getElementById("event-form");
    if (form) {
      form.reset();
      // Clear dynamic content
      document.getElementById("selectedTags").innerHTML = "";
      // Clear button selections
      document
        .querySelectorAll(".priority-btn, .reminder-btn")
        .forEach((btn) => btn.classList.remove("selected"));
    }
  }

  /**
   * Open modal for creating a new event at specified time
   * @param {string|Date} date - Date for the new event
   * @param {number} hour - Hour (0-23) for the new event
   */
  openEventModal(date, hour) {
    // Store current date for form submission
    this._currentDate = date;
    this.resetForm();

    // Pre-populate time input with selected hour
    const eventTimeInput = document.getElementById("eventTime");
    if (eventTimeInput) {
      const hourStr = hour.toString().padStart(2, "0");
      eventTimeInput.value = `${hourStr}:00`;
    }

    // Update display elements (if they exist in form view)
    if (this.eventDateEl) {
      this.eventDateEl.textContent = this.formatDate(date);
    }
    if (this.eventTimeEl) {
      this.eventTimeEl.textContent = formatTime(
        new Date().setHours(hour, 0, 0),
      );
    }

    this.showEventForm();
    this.showModal();
  }

  /**
   * Open modal to display existing event details
   * @param {Object} event - Event object to display
   */
  openEventDetails(event) {
    // Update modal heading with event title
    if (this.modalHeading) {
      this.modalHeading.textContent = event.title;
    }

    const date = new Date(event.date);

    // Update detail display elements
    if (this.eventDateEl) {
      this.eventDateEl.textContent = this.formatDate(date);
    }
    if (this.eventTimeEl) {
      this.eventTimeEl.textContent = formatTime(event.date);
    }
    if (this.eventNotes) {
      this.eventNotes.textContent = event.notes || "No notes added";
    }

    // Set up action buttons with clean event listeners
    // IMPORTANT: Clone buttons to remove any existing listeners
    const editBtn = this.modal.querySelector(".edit-btn");
    const deleteBtn = this.modal.querySelector(".delete-btn");

    // Edit button setup
    if (editBtn) {
      const newEditBtn = editBtn.cloneNode(true);
      editBtn.parentNode.replaceChild(newEditBtn, editBtn);

      // Add single event listener to new button
      newEditBtn.addEventListener("click", () => this.openEditForm(event));
    }

    // Delete button setup
    if (deleteBtn) {
      const newDeleteBtn = deleteBtn.cloneNode(true);
      deleteBtn.parentNode.replaceChild(newDeleteBtn, deleteBtn);

      // Add single event listener with async error handling
      newDeleteBtn.addEventListener("click", async () => {
        if (confirm("Are you sure you want to delete this event?")) {
          try {
            await this.eventManager.deleteEvent(event.id);
            this.closeModal();
          } catch (error) {
            console.error("Error deleting event:", error);
            alert("Failed to delete event. Please try again.");
          }
        }
      });
    }

    this.showEventDetails();
    this.showModal();
  }

  /**
   * Open modal in edit mode for existing event
   * @param {Object} event - Event object to edit
   */
  openEditForm(event) {
    // Store event data for form submission
    this._currentEventId = event.id;
    this._currentDate = new Date(event.date);

    // Update modal header
    if (this.modalHeading) {
      this.modalHeading.textContent = "Edit Event";
    }

    // Populate form with existing event data
    document.getElementById("eventTitle").value = event.title;
    document.getElementById("eventTime").value = new Date(event.date)
      .toTimeString()
      .slice(0, 5);
    document.getElementById("eventNotes").value = event.notes || "";

    // Set priority selection if exists
    if (event.priority) {
      document
        .querySelector(`.priority-btn[data-priority="${event.priority}"]`)
        ?.classList.add("selected");
    }

    // Set reminder selection if exists
    if (event.reminder) {
      document
        .querySelector(`.reminder-btn[data-time="${event.reminder}"]`)
        ?.classList.add("selected");
    }

    // Populate tags
    const tagsContainer = document.getElementById("selectedTags");
    tagsContainer.innerHTML = "";
    event.tags?.forEach((tag) => this.addTag(tag));

    // Override form submission handler for edit mode
    const eventForm = document.getElementById("event-form");
    if (eventForm) {
      eventForm.onsubmit = (e) => {
        e.preventDefault();
        this.handleEditSubmit(this._currentEventId);
      };
    }

    // Show the form
    this.showEventForm();
    this.showModal();
  }

  /**
   * Handle form submission for new event creation
   */
  handleEventSubmit() {
    const eventTitle = document.getElementById("eventTitle").value;

    // Basic validation - require title
    if (!eventTitle.trim()) return;

    // Build event data object
    const eventData = {
      id: Date.now().toString(), // Generate unique ID
      title: eventTitle,
      date: new Date(this._currentDate),
      priority:
        document.querySelector(".priority-btn.selected")?.dataset.priority ||
        "low",
      reminder: document.querySelector(".reminder-btn.selected")?.dataset.time,
      notes: document.getElementById("eventNotes").value,
      tags: Array.from(document.querySelectorAll(".tag")).map(
        (tag) => tag.dataset.value,
      ),
    };

    // Set time from form input
    const timeInput = document.getElementById("eventTime");
    if (timeInput?.value) {
      const [hours, minutes] = timeInput.value.split(":").map(Number);
      eventData.date.setHours(hours, minutes);
    }

    // Submit new event and close modal
    this.eventManager.addEvent(eventData);
    this.closeModal();
  }

  /**
   * Handle form submission for event editing
   * @param {string} eventId - ID of event being edited
   */
  handleEditSubmit(eventId) {
    const eventTitle = document.getElementById("eventTitle").value;

    // Basic validation - require title
    if (!eventTitle.trim()) return;

    // Build updated event date
    const eventDate = new Date(this._currentDate);
    const timeInput = document.getElementById("eventTime");
    if (timeInput?.value) {
      const [hours, minutes] = timeInput.value.split(":").map(Number);
      eventDate.setHours(hours, minutes);
    }

    // Build updated event data object
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
        (tag) => tag.dataset.value,
      ),
    };

    // Note: Using updateEvent instead of editEvent - this may need to be changed
    // to match the EventManager interface
    this.eventManager.updateEvent(eventId, eventData);
    this.closeModal();
  }

  /**
   * Format date for display using user's locale
   * @param {Date|string} date - Date to format
   * @returns {string} Formatted date string with weekday
   */
  formatDate(date) {
    // Detect user's locale preference
    const userLocale = navigator.language || "en-US";

    const options = { year: "numeric", month: "long", day: "numeric" };
    const formattedDate = new Date(date).toLocaleDateString(
      userLocale,
      options,
    );

    const weekday = new Date(date).toLocaleDateString(userLocale, {
      weekday: "long",
    });

    return `${formattedDate} (${weekday})`;
  }

  /**
   * Add a tag to the form with removal functionality
   * @param {string} tag - Tag text to add
   */
  addTag(tag) {
    const tagContainer = document.getElementById("selectedTags");

    // Create tag element
    const tagElement = document.createElement("span");
    tagElement.classList.add("tag");
    tagElement.dataset.value = tag;
    tagElement.textContent = tag;

    // Create remove button
    const removeBtn = document.createElement("span");
    removeBtn.classList.add("tag-remove");
    removeBtn.textContent = "×";

    // Add click handler to remove tag
    removeBtn.addEventListener("click", () => tagElement.remove());

    // Append elements
    tagElement.appendChild(removeBtn);
    tagContainer.appendChild(tagElement);
  }
}
