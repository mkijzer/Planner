// --------------------------------------------------
// new TaskForm.js
// --------------------------------------------------

// src/js/components/tasks/TaskForm.js
import { Component } from "../Component.js";

export class TaskForm extends Component {
  constructor(container, taskService) {
    super(container, {
      date: null,
      taskId: null,
      task: null,
    });
    this.taskService = taskService;
    this.form = container.querySelector("#task-form");
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
    const tagInput = this.container.querySelector("#taskCategory");
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
    const taskTitle = this.container.querySelector("#taskTitle").value;
    if (!taskTitle.trim()) {
      alert("Task title is required!"); // Notify the user
      return;
    }

    const taskData = {
      id: this.state.taskId || Date.now().toString(),
      title: taskTitle,
      date: this.state.date,
      priority:
        this.container.querySelector(".priority-btn.selected")?.dataset
          .priority || "low",
      reminder: this.container.querySelector(".reminder-btn.selected")?.dataset
        .time,
      notes: this.container.querySelector("#taskNotes").value,
      tags: Array.from(this.container.querySelectorAll(".tag")).map(
        (tag) => tag.dataset.value
      ),
    };

    // Set the time for the task
    const timeInput = this.container.querySelector("#taskTime");
    const [hours, minutes] = timeInput.value.split(":").map(Number);
    taskData.date.setHours(hours, minutes, 0, 0);

    try {
      if (this.state.taskId) {
        // Edit existing task
        await this.taskService.editTask(taskData);
        console.log("Task updated successfully!");
      } else {
        // Add new task
        await this.taskService.addTask(taskData);
        console.log("Task added successfully!");
      }

      // Reset the form and notify the user
      this.resetForm();
      document.dispatchEvent(new CustomEvent("taskSaved"));
      alert("Task saved successfully!"); // Notify the user
    } catch (error) {
      console.error("Failed to save task:", error);
      alert("Failed to save task. Please try again."); // Notify the user
    }
  }

  resetForm() {
    this.form.reset();
    this.container.querySelector("#selectedTags").innerHTML = "";
    this.container
      .querySelectorAll(".priority-btn, .reminder-btn")
      .forEach((btn) => btn.classList.remove("selected"));
  }

  setTask(task, date) {
    this.setState({
      date: date || new Date(task?.date) || new Date(),
      taskId: task?.id || null,
      task: task || null,
    });

    if (task) {
      this.container.querySelector("#taskTitle").value = task.title;
      this.container.querySelector("#taskTime").value = new Date(task.date)
        .toTimeString()
        .slice(0, 5);
      this.container.querySelector("#taskNotes").value = task.notes || "";

      // Set priority
      if (task.priority) {
        this.container
          .querySelector(`.priority-btn[data-priority="${task.priority}"]`)
          ?.classList.add("selected");
      }

      // Set reminder
      if (task.reminder) {
        this.container
          .querySelector(`.reminder-btn[data-time="${task.reminder}"]`)
          ?.classList.add("selected");
      }

      // Set tags
      task.tags?.forEach((tag) => this.addTag(tag));
    }
  }
}
// --------------------------------------------------
// old TaskForm.js
// --------------------------------------------------

// // src/js/components/tasks/TaskForm.js
// import { Component } from "../Component.js";

// export class TaskForm extends Component {
//   constructor(container, taskService) {
//     super(container, {
//       date: null,
//       taskId: null,
//       task: null,
//     });
//     this.taskService = taskService;
//     this.form = container.querySelector("#task-form");
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
//     const tagInput = this.container.querySelector("#taskCategory");
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
//     const taskTitle = this.container.querySelector("#taskTitle").value;
//     if (!taskTitle.trim()) return;

//     const taskData = {
//       id: this.state.taskId || Date.now().toString(),
//       title: taskTitle,
//       date: this.state.date,
//       priority:
//         this.container.querySelector(".priority-btn.selected")?.dataset
//           .priority || "low",
//       reminder: this.container.querySelector(".reminder-btn.selected")?.dataset
//         .time,
//       notes: this.container.querySelector("#taskNotes").value,
//       tags: Array.from(this.container.querySelectorAll(".tag")).map(
//         (tag) => tag.dataset.value
//       ),
//     };

//     const timeInput = this.container.querySelector("#taskTime");
//     const [hours, minutes] = timeInput.value.split(":").map(Number);
//     taskData.date.setHours(hours, minutes, 0, 0);

//     if (this.state.taskId) {
//       this.taskService.editTask(taskData);
//     } else {
//       this.taskService.addTask(taskData);
//     }

//     this.resetForm();
//     document.dispatchEvent(new CustomEvent("taskSaved"));
//   }

//   resetForm() {
//     this.form.reset();
//     this.container.querySelector("#selectedTags").innerHTML = "";
//     this.container
//       .querySelectorAll(".priority-btn, .reminder-btn")
//       .forEach((btn) => btn.classList.remove("selected"));
//   }

//   setTask(task, date) {
//     this.setState({
//       date: date || new Date(task?.date) || new Date(),
//       taskId: task?.id || null,
//       task: task || null,
//     });

//     if (task) {
//       this.container.querySelector("#taskTitle").value = task.title;
//       this.container.querySelector("#taskTime").value = new Date(task.date)
//         .toTimeString()
//         .slice(0, 5);
//       this.container.querySelector("#taskNotes").value = task.notes || "";

//       // Set priority
//       if (task.priority) {
//         this.container
//           .querySelector(`.priority-btn[data-priority="${task.priority}"]`)
//           ?.classList.add("selected");
//       }

//       // Set reminder
//       if (task.reminder) {
//         this.container
//           .querySelector(`.reminder-btn[data-time="${task.reminder}"]`)
//           ?.classList.add("selected");
//       }

//       // Set tags
//       task.tags?.forEach((tag) => this.addTag(tag));
//     }
//   }
// }
