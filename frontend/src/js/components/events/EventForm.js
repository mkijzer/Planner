/**
 * EventForm Component
 *
 * Handles event creation and editing with:
 * - Form validation and error handling
 * - Priority and reminder selection
 * - Tag management
 * - Loading states to prevent double submission
 */

import { Component } from "../Component.js";

/**
 * Form validation utilities
 */
const FormValidation = {
  /**
   * Validate event title
   * @param {string} title - Title to validate
   * @returns {Object} Validation result
   */
  validateTitle(title) {
    const trimmed = title?.trim();
    if (!trimmed) {
      return { valid: false, message: "Event title is required" };
    }
    if (trimmed.length > 100) {
      return {
        valid: false,
        message: "Title must be less than 100 characters",
      };
    }
    return { valid: true };
  },

  /**
   * Validate event date
   * @param {Date} date - Date to validate
   * @returns {Object} Validation result
   */
  validateDate(date) {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return { valid: false, message: "Valid date is required" };
    }
    return { valid: true };
  },
};

export class EventForm extends Component {
  /**
   * Create EventForm instance
   * @param {HTMLElement} container - Form container element
   * @param {EventService} eventService - Service for event operations
   */
  constructor(container, eventService) {
    super(container, {
      date: null,
      eventId: null,
      event: null,
      isSubmitting: false, // Track submission state
    });

    this.eventService = eventService;
    this.form = container.querySelector("#event-form");
    this.submitButton = this.form?.querySelector('button[type="submit"]');

    if (!this.form) {
      throw new Error("Event form not found in container");
    }

    // Cache form elements for better performance
    this.cacheFormElements();
  }

  /**
   * Cache frequently accessed form elements
   */
  cacheFormElements() {
    this.elements = {
      title: this.container.querySelector("#eventTitle"),
      time: this.container.querySelector("#eventTime"),
      notes: this.container.querySelector("#eventNotes"),
      tagsContainer: this.container.querySelector("#selectedTags"),
      tagInput: this.container.querySelector("#eventCategory"),
      priorityContainer: this.container.querySelector(".priority-buttons"),
      reminderContainer: this.container.querySelector(".reminder-buttons"),
    };
  }

  /**
   * Set up all form event listeners
   */
  setupEventListeners() {
    // Form submission with loading state
    this.form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await this.handleSubmit();
    });

    // Priority button selection
    if (this.elements.priorityContainer) {
      this.elements.priorityContainer.addEventListener("click", (e) => {
        this.handlePrioritySelection(e);
      });
    }

    // Tag input handling
    if (this.elements.tagInput) {
      this.elements.tagInput.addEventListener("keydown", (e) => {
        this.handleTagInput(e);
      });
    }

    // Tag removal
    if (this.elements.tagsContainer) {
      this.elements.tagsContainer.addEventListener("click", (e) => {
        this.handleTagRemoval(e);
      });
    }

    // Reminder button selection
    if (this.elements.reminderContainer) {
      this.elements.reminderContainer.addEventListener("click", (e) => {
        this.handleReminderSelection(e);
      });
    }
  }

  /**
   * Handle priority button selection
   * @param {Event} e - Click event
   */
  handlePrioritySelection(e) {
    const btn = e.target.closest(".priority-btn");
    if (btn) {
      // Remove selection from all buttons
      this.elements.priorityContainer
        .querySelectorAll(".priority-btn")
        .forEach((b) => b.classList.remove("selected"));

      // Add selection to clicked button
      btn.classList.add("selected");
    }
  }

  /**
   * Handle tag input keydown
   * @param {KeyboardEvent} e - Keydown event
   */
  handleTagInput(e) {
    if (e.key === "Enter" && this.elements.tagInput.value.trim()) {
      e.preventDefault();
      this.addTag(this.elements.tagInput.value.trim());
      this.elements.tagInput.value = "";
    }
  }

  /**
   * Handle tag removal clicks
   * @param {Event} e - Click event
   */
  handleTagRemoval(e) {
    if (e.target.classList.contains("tag-remove")) {
      e.target.parentElement.remove();
    }
  }

  /**
   * Handle reminder button selection
   * @param {Event} e - Click event
   */
  handleReminderSelection(e) {
    const btn = e.target.closest(".reminder-btn");
    if (btn) {
      // Remove selection from all buttons
      this.elements.reminderContainer
        .querySelectorAll(".reminder-btn")
        .forEach((b) => b.classList.remove("selected"));

      // Add selection to clicked button
      btn.classList.add("selected");
    }
  }

  /**
   * Add a tag to the form with safe HTML creation
   * @param {string} tagValue - Tag value to add
   */
  addTag(tagValue) {
    // Prevent duplicate tags
    const existingTags = Array.from(
      this.elements.tagsContainer.querySelectorAll(".tag"),
    ).map((tag) => tag.dataset.value);

    if (existingTags.includes(tagValue)) {
      this.showNotification("Tag already exists", "warning");
      return;
    }

    // Create tag element safely
    const tagElement = document.createElement("span");
    tagElement.className = "tag";
    tagElement.dataset.value = tagValue;
    tagElement.textContent = tagValue;

    // Create remove button
    const removeBtn = document.createElement("span");
    removeBtn.className = "tag-remove";
    removeBtn.textContent = "×";
    removeBtn.setAttribute("aria-label", `Remove ${tagValue} tag`);

    tagElement.appendChild(removeBtn);
    this.elements.tagsContainer.appendChild(tagElement);
  }

  /**
   * Handle form submission with proper validation and error handling
   */
  async handleSubmit() {
    // Prevent double submission
    if (this.state.isSubmitting) {
      return;
    }

    try {
      // Set loading state
      this.setSubmissionState(true);

      // Validate form data
      const validationResult = this.validateForm();
      if (!validationResult.valid) {
        this.showNotification(validationResult.message, "error");
        return;
      }

      // Build event data
      const eventData = this.buildEventData();

      // Submit to service
      if (this.state.eventId) {
        await this.eventService.editEvent(eventData);
        this.showNotification("Event updated successfully!", "success");
      } else {
        await this.eventService.addEvent(eventData);
        this.showNotification("Event created successfully!", "success");
      }

      // Reset form and notify other components
      this.resetForm();
      document.dispatchEvent(
        new CustomEvent("eventSaved", {
          detail: { eventData },
        }),
      );
    } catch (error) {
      console.error("Failed to save event:", error);
      this.showNotification(
        error.message || "Failed to save event. Please try again.",
        "error",
      );
    } finally {
      // Always reset loading state
      this.setSubmissionState(false);
    }
  }

  /**
   * Validate form data
   * @returns {Object} Validation result
   */
  validateForm() {
    // Validate title
    const titleValidation = FormValidation.validateTitle(
      this.elements.title?.value,
    );
    if (!titleValidation.valid) {
      return titleValidation;
    }

    // Validate date
    const dateValidation = FormValidation.validateDate(this.state.date);
    if (!dateValidation.valid) {
      return dateValidation;
    }

    return { valid: true };
  }

  /**
   * Build event data object from form inputs
   * @returns {Object} Event data
   */
  buildEventData() {
    // Ensure we have a valid date object
    const eventDate = new Date(this.state.date);

    // Set time from form input
    const timeInput = this.elements.time;
    if (timeInput?.value) {
      const [hours, minutes] = timeInput.value.split(":").map(Number);
      eventDate.setHours(hours, minutes, 0, 0);
    }

    return {
      id: this.state.eventId || Date.now().toString(),
      title: this.elements.title.value.trim(),
      date: eventDate,
      priority: this.getSelectedPriority(),
      reminder: this.getSelectedReminder(),
      notes: this.elements.notes?.value || "",
      tags: this.getSelectedTags(),
    };
  }

  /**
   * Get selected priority from form
   * @returns {string} Selected priority
   */
  getSelectedPriority() {
    const selected = this.elements.priorityContainer?.querySelector(
      ".priority-btn.selected",
    );
    return selected?.dataset.priority || "low";
  }

  /**
   * Get selected reminder time from form
   * @returns {string|null} Selected reminder time
   */
  getSelectedReminder() {
    const selected = this.elements.reminderContainer?.querySelector(
      ".reminder-btn.selected",
    );
    return selected?.dataset.time || null;
  }

  /**
   * Get all selected tags
   * @returns {Array} Array of tag values
   */
  getSelectedTags() {
    return Array.from(this.elements.tagsContainer.querySelectorAll(".tag")).map(
      (tag) => tag.dataset.value,
    );
  }

  /**
   * Set form submission state and update UI
   * @param {boolean} isSubmitting - Whether form is currently submitting
   */
  setSubmissionState(isSubmitting) {
    this.setState({ isSubmitting });

    if (this.submitButton) {
      this.submitButton.disabled = isSubmitting;
      this.submitButton.textContent = isSubmitting ? "Saving..." : "Save Event";
    }
  }

  /**
   * Show notification to user (placeholder for proper notification system)
   * @param {string} message - Message to show
   * @param {string} type - Notification type (success, error, warning)
   */
  showNotification(message, type = "info") {
    // TODO: Replace with proper toast notification component
    // For now, use console and simple alert fallback
    console.log(`${type.toUpperCase()}: ${message}`);

    if (type === "error") {
      alert(message); // Only use alert for errors until we have better UI
    }
  }

  /**
   * Reset form to initial state
   */
  resetForm() {
    if (this.form) {
      this.form.reset();
    }

    // Clear tags
    if (this.elements.tagsContainer) {
      this.elements.tagsContainer.innerHTML = "";
    }

    // Clear selections
    this.container
      .querySelectorAll(".priority-btn, .reminder-btn")
      .forEach((btn) => btn.classList.remove("selected"));

    // Reset state
    this.setState({
      date: null,
      eventId: null,
      event: null,
      isSubmitting: false,
    });
  }

  /**
   * Populate form with existing event data
   * @param {Object} event - Event data to populate
   * @param {Date} date - Event date
   */
  setEvent(event, date) {
    // Ensure we always have a valid date
    const validDate = date
      ? new Date(date)
      : event?.date
        ? new Date(event.date)
        : new Date();

    this.setState({
      date: validDate,
      eventId: event?.id || null,
      event: event || null,
    });

    if (event) {
      // Populate form fields
      if (this.elements.title) {
        this.elements.title.value = event.title || "";
      }

      if (this.elements.time) {
        this.elements.time.value = new Date(event.date)
          .toTimeString()
          .slice(0, 5);
      }

      if (this.elements.notes) {
        this.elements.notes.value = event.notes || "";
      }

      // Set priority selection
      if (event.priority) {
        const priorityBtn = this.container.querySelector(
          `.priority-btn[data-priority="${event.priority}"]`,
        );
        priorityBtn?.classList.add("selected");
      }

      // Set reminder selection
      if (event.reminder) {
        const reminderBtn = this.container.querySelector(
          `.reminder-btn[data-time="${event.reminder}"]`,
        );
        reminderBtn?.classList.add("selected");
      }

      // Add tags
      if (Array.isArray(event.tags)) {
        event.tags.forEach((tag) => this.addTag(tag));
      }
    }
  }

  /**
   * Clean up component resources
   */
  destroy() {
    // Reset submission state
    this.setSubmissionState(false);

    // Clear form
    this.resetForm();

    console.log("EventForm component destroyed");
  }
}
