// --------------------------------------------------
// new EventForm.js
// --------------------------------------------------

// src/js/components/events/EventForm.js
import { Component } from "../Component.js";

export class EventForm extends Component {
  constructor(container, eventService) {
    super(container, {
      date: null,
      eventId: null,
      event: null,
    });
    this.eventService = eventService;
    this.form = container.querySelector("#event-form");
  }

  setupEventListeners() {
    // Form submission
    this.form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await this.handleSubmit(); // Await the async handleSubmit method
    });

    // Priority buttons
    const priorityContainer = this.container.querySelector(".priority-buttons");
    priorityContainer?.addEventListener("click", (e) => {
      const btn = e.target.closest(".priority-btn");
      if (btn) {
        priorityContainer
          .querySelectorAll(".priority-btn")
          .forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
      }
    });

    // Tags
    const tagInput = this.container.querySelector("#eventCategory");
    tagInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && tagInput.value.trim()) {
        e.preventDefault();
        this.addTag(tagInput.value.trim());
        tagInput.value = "";
      }
    });

    // Tag removal
    this.container
      .querySelector("#selectedTags")
      ?.addEventListener("click", (e) => {
        if (e.target.classList.contains("tag-remove")) {
          e.target.parentElement.remove();
        }
      });

    // Reminder buttons
    const reminderContainer = this.container.querySelector(".reminder-buttons");
    reminderContainer?.addEventListener("click", (e) => {
      const btn = e.target.closest(".reminder-btn");
      if (btn) {
        reminderContainer
          .querySelectorAll(".reminder-btn")
          .forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
      }
    });
  }

  addTag(tagValue) {
    const tagsContainer = this.container.querySelector("#selectedTags");
    tagsContainer.innerHTML += `
      <span class="tag" data-value="${tagValue}">
        ${tagValue}
        <span class="tag-remove">&times;</span>
      </span>
    `;
  }

  // Updated to handle async operations
  async handleSubmit() {
    const eventTitle = this.container.querySelector("#eventTitle").value;
    if (!eventTitle.trim()) {
      alert("Event title is required!"); // Notify the user
      return;
    }

    const eventData = {
      id: this.state.eventId || Date.now().toString(),
      title: eventTitle,
      date: this.state.date,
      priority:
        this.container.querySelector(".priority-btn.selected")?.dataset
          .priority || "low",
      reminder: this.container.querySelector(".reminder-btn.selected")?.dataset
        .time,
      notes: this.container.querySelector("#eventNotes").value,
      tags: Array.from(this.container.querySelectorAll(".tag")).map(
        (tag) => tag.dataset.value
      ),
    };

    // Set the time for the event
    const timeInput = this.container.querySelector("#eventTime");
    const [hours, minutes] = timeInput.value.split(":").map(Number);
    eventData.date.setHours(hours, minutes, 0, 0);

    try {
      if (this.state.eventId) {
        // Edit existing event
        await this.eventService.editEvent(eventData);
        console.log("Event updated successfully!");
      } else {
        // Add new event
        await this.eventService.addEvent(eventData);
        console.log("Event added successfully!");
      }

      // Reset the form and notify the user
      this.resetForm();
      document.dispatchEvent(new CustomEvent("eventSaved"));
      alert("Event saved successfully!"); // Notify the user
    } catch (error) {
      console.error("Failed to save event:", error);
      alert("Failed to save event. Please try again."); // Notify the user
    }
  }

  resetForm() {
    this.form.reset();
    this.container.querySelector("#selectedTags").innerHTML = "";
    this.container
      .querySelectorAll(".priority-btn, .reminder-btn")
      .forEach((btn) => btn.classList.remove("selected"));
  }

  setEvent(event, date) {
    this.setState({
      date: date || new Date(event?.date) || new Date(),
      eventId: event?.id || null,
      event: event || null,
    });

    if (event) {
      this.container.querySelector("#eventTitle").value = event.title;
      this.container.querySelector("#eventTime").value = new Date(event.date)
        .toTimeString()
        .slice(0, 5);
      this.container.querySelector("#eventNotes").value = event.notes || "";

      // Set priority
      if (event.priority) {
        this.container
          .querySelector(`.priority-btn[data-priority="${event.priority}"]`)
          ?.classList.add("selected");
      }

      // Set reminder
      if (event.reminder) {
        this.container
          .querySelector(`.reminder-btn[data-time="${event.reminder}"]`)
          ?.classList.add("selected");
      }

      // Set tags
      event.tags?.forEach((tag) => this.addTag(tag));
    }
  }
}
// --------------------------------------------------
// old EventForm.js
// --------------------------------------------------

// // src/js/components/events/EventForm.js
// import { Component } from "../Component.js";

// export class EventForm extends Component {
//   constructor(container, eventService) {
//     super(container, {
//       date: null,
//       eventId: null,
//       event: null,
//     });
//     this.eventService = eventService;
//     this.form = container.querySelector("#event-form");
//   }

//   setupEventListeners() {
//     // Form submission
//     this.form.addEventListener("submit", (e) => {
//       e.preventDefault();
//       this.handleSubmit();
//     });

//     // Priority buttons
//     const priorityContainer = this.container.querySelector(".priority-buttons");
//     priorityContainer?.addEventListener("click", (e) => {
//       const btn = e.target.closest(".priority-btn");
//       if (btn) {
//         priorityContainer
//           .querySelectorAll(".priority-btn")
//           .forEach((b) => b.classList.remove("selected"));
//         btn.classList.add("selected");
//       }
//     });

//     // Tags
//     const tagInput = this.container.querySelector("#eventCategory");
//     tagInput?.addEventListener("keydown", (e) => {
//       if (e.key === "Enter" && tagInput.value.trim()) {
//         e.preventDefault();
//         this.addTag(tagInput.value.trim());
//         tagInput.value = "";
//       }
//     });

//     // Tag removal
//     this.container
//       .querySelector("#selectedTags")
//       ?.addEventListener("click", (e) => {
//         if (e.target.classList.contains("tag-remove")) {
//           e.target.parentElement.remove();
//         }
//       });

//     // Reminder buttons
//     const reminderContainer = this.container.querySelector(".reminder-buttons");
//     reminderContainer?.addEventListener("click", (e) => {
//       const btn = e.target.closest(".reminder-btn");
//       if (btn) {
//         reminderContainer
//           .querySelectorAll(".reminder-btn")
//           .forEach((b) => b.classList.remove("selected"));
//         btn.classList.add("selected");
//       }
//     });
//   }

//   addTag(tagValue) {
//     const tagsContainer = this.container.querySelector("#selectedTags");
//     tagsContainer.innerHTML += `
//       <span class="tag" data-value="${tagValue}">
//         ${tagValue}
//         <span class="tag-remove">&times;</span>
//       </span>
//     `;
//   }

//   handleSubmit() {
//     const eventTitle = this.container.querySelector("#eventTitle").value;
//     if (!eventTitle.trim()) return;

//     const eventData = {
//       id: this.state.eventId || Date.now().toString(),
//       title: eventTitle,
//       date: this.state.date,
//       priority:
//         this.container.querySelector(".priority-btn.selected")?.dataset
//           .priority || "low",
//       reminder: this.container.querySelector(".reminder-btn.selected")?.dataset
//         .time,
//       notes: this.container.querySelector("#eventNotes").value,
//       tags: Array.from(this.container.querySelectorAll(".tag")).map(
//         (tag) => tag.dataset.value
//       ),
//     };

//     const timeInput = this.container.querySelector("#eventTime");
//     const [hours, minutes] = timeInput.value.split(":").map(Number);
//     eventData.date.setHours(hours, minutes, 0, 0);

//     if (this.state.eventId) {
//       this.eventService.editEvent(eventData);
//     } else {
//       this.eventService.addEvent(eventData);
//     }

//     this.resetForm();
//     document.dispatchEvent(new CustomEvent("eventSaved"));
//   }

//   resetForm() {
//     this.form.reset();
//     this.container.querySelector("#selectedTags").innerHTML = "";
//     this.container
//       .querySelectorAll(".priority-btn, .reminder-btn")
//       .forEach((btn) => btn.classList.remove("selected"));
//   }

//   setEvent(event, date) {
//     this.setState({
//       date: date || new Date(event?.date) || new Date(),
//       eventId: event?.id || null,
//       event: event || null,
//     });

//     if (event) {
//       this.container.querySelector("#eventTitle").value = event.title;
//       this.container.querySelector("#eventTime").value = new Date(event.date)
//         .toTimeString()
//         .slice(0, 5);
//       this.container.querySelector("#eventNotes").value = event.notes || "";

//       // Set priority
//       if (event.priority) {
//         this.container
//           .querySelector(`.priority-btn[data-priority="${event.priority}"]`)
//           ?.classList.add("selected");
//       }

//       // Set reminder
//       if (event.reminder) {
//         this.container
//           .querySelector(`.reminder-btn[data-time="${event.reminder}"]`)
//           ?.classList.add("selected");
//       }

//       // Set tags
//       event.tags?.forEach((tag) => this.addTag(tag));
//     }
//   }
// }
