export class CalendarTaskModal {
  constructor(calendar) {
    this.calendar = calendar;
    this.modal = document.getElementById("taskModal");
    this.tasksView = document.getElementById("tasks-view");
    this.addTaskForm = document.getElementById("add-task-form");
    this.modalDate = document.getElementById("modal-date");

    this.initialize();
  }

  initialize() {
    this.setupEventListeners();
    this.setupFormHandlers();
    this.setupModalClose();
  }

  setupEventListeners() {
    // Listen for calendar events
    document.addEventListener("openTaskModal", (e) => {
      const { date, hour } = e.detail;
      this.openTaskModal(date, hour);
    });

    document.addEventListener("openTaskDetails", (e) => {
      const { task } = e.detail;
      this.openTaskDetails(task);
    });

    document.getElementById("show-task-form")?.addEventListener("click", () => {
      this.tasksView.classList.add("hidden");
      this.addTaskForm.classList.remove("hidden");
    });
  }

  setupFormHandlers() {
    console.log("Setting up form handlers");

    // Use event delegation for priority buttons
    const priorityContainer = document.querySelector(".priority-buttons");
    if (priorityContainer) {
      priorityContainer.addEventListener("click", (e) => {
        const priorityBtn = e.target.closest(".priority-btn");
        if (priorityBtn) {
          console.log("Priority button clicked:", priorityBtn.dataset.priority);

          // Remove selected from all buttons
          priorityContainer.querySelectorAll(".priority-btn").forEach((btn) => {
            btn.classList.remove("selected");
          });

          // Add selected to clicked button
          priorityBtn.classList.add("selected");
        }
      });
    } else {
      console.error("Priority buttons container not found");
    }

    // Use event delegation for reminder buttons
    const reminderContainer = document.querySelector(".reminder-buttons");
    if (reminderContainer) {
      reminderContainer.addEventListener("click", (e) => {
        const reminderBtn = e.target.closest(".reminder-btn");
        if (reminderBtn) {
          console.log("Reminder button clicked:", reminderBtn.dataset.time);

          // Remove selected from all buttons
          reminderContainer.querySelectorAll(".reminder-btn").forEach((btn) => {
            btn.classList.remove("selected");
          });

          // Add selected to clicked button
          reminderBtn.classList.add("selected");
        }
      });
    } else {
      console.error("Reminder buttons container not found");
    }

    // Tag input
    const tagInput = document.getElementById("taskCategory");
    tagInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && tagInput.value.trim()) {
        e.preventDefault();
        this.addTag(tagInput.value.trim());
        tagInput.value = "";
      }
    });

    // Tag removal
    document.getElementById("selectedTags").addEventListener("click", (e) => {
      if (e.target.classList.contains("tag-remove")) {
        e.target.parentElement.remove();
      }
    });
  }

  setupModalClose() {
    const modalCloseButton = document.querySelector(".modal-close");
    if (modalCloseButton) {
      modalCloseButton.addEventListener("click", () => {
        this.modal?.classList.remove("show");
        this.modal?.setAttribute("aria-hidden", "true");
      });
    }
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

  openTaskModal(date, hour) {
    // Format time string
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

    // Update modal content
    this.modalDate.textContent = `${date.toDateString()} at ${timeStr}`;
    this.tasksView.classList.add("hidden");
    this.addTaskForm.classList.remove("hidden");

    // Reset form
    this.resetForm();

    // Set time input constraints
    this.setupTimeInput(hour);

    // Setup form submission
    this.setupTaskForm(date);

    this.modal.classList.add("show");
    this.modal.setAttribute("aria-hidden", "false");
  }

  setupTimeInput(hour) {
    const taskTimeInput = document.getElementById("taskTime");
    if (taskTimeInput) {
      const minHour = hour.toString().padStart(2, "0");
      const maxHour = (hour + 1).toString().padStart(2, "0");
      taskTimeInput.min = `${minHour}:00`;
      taskTimeInput.max = `${maxHour}:00`;
      taskTimeInput.value = `${minHour}:00`;
    }
  }

  setupTaskForm(date) {
    const taskForm = document.getElementById("task-form");
    if (taskForm) {
      // Remove existing listeners
      const newTaskForm = taskForm.cloneNode(true);
      taskForm.parentNode.replaceChild(newTaskForm, taskForm);

      newTaskForm.onsubmit = (event) => {
        event.preventDefault();
        this.handleTaskSubmit(date);
      };
    }
  }

  handleTaskSubmit(date) {
    const taskTitle = document.getElementById("taskTitle").value;
    if (!taskTitle.trim()) return;

    const taskDate = new Date(date);
    const timeInput = document.getElementById("taskTime");
    const [hours, minutes] = timeInput.value.split(":").map(Number);
    taskDate.setHours(hours, minutes, 0, 0);

    const taskData = {
      title: taskTitle,
      date: taskDate,
      priority:
        document.querySelector(".priority-btn.selected")?.dataset.priority ||
        "low",
      reminder: document.querySelector(".reminder-btn.selected")?.dataset.time,
      notes: document.getElementById("taskNotes").value,
      tags: Array.from(document.querySelectorAll(".tag")).map(
        (tag) => tag.dataset.value
      ),
    };

    // Add task to calendar
    this.calendar.addTask(taskData);

    // Reset form
    this.resetForm();

    // Close modal
    this.modal.classList.remove("show");
  }

  resetForm() {
    document.getElementById("taskTitle").value = "";
    document.getElementById("taskNotes").value = "";
    document.getElementById("selectedTags").innerHTML = "";

    // Reset priority buttons
    const priorityContainer = document.querySelector(".priority-buttons");
    priorityContainer?.querySelectorAll(".priority-btn").forEach((btn) => {
      btn.classList.remove("selected");
    });

    // Reset reminder buttons
    const reminderContainer = document.querySelector(".reminder-buttons");
    reminderContainer?.querySelectorAll(".reminder-btn").forEach((btn) => {
      btn.classList.remove("selected");
    });
  }

  openTaskDetails(task) {
    // Format time
    const taskDate = new Date(task.date);
    const hours = taskDate.getHours();
    const minutes = taskDate.getMinutes();
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const timeString = `${displayHours}:${minutes
      .toString()
      .padStart(2, "0")} ${period}`;

    // Set modal title
    this.modalDate.textContent = `${taskDate.toDateString()} at ${timeString}`;

    // Update task list
    const taskListContainer = document.getElementById("task-list-container");
    taskListContainer.innerHTML = this.generateTaskDetailsHTML(
      task,
      timeString
    );

    // Show correct view
    this.tasksView.classList.remove("hidden");
    this.addTaskForm.classList.add("hidden");
    this.modal.classList.add("show");
    this.modal.setAttribute("aria-hidden", "false");
  }

  generateTaskDetailsHTML(task, timeString) {
    return `
            <li class="task-list-item">
                <div class="task-header">
                    <h3>${task.title}</h3>
                    <div class="task-preview-priority ${task.priority}"></div>
                </div>
                <div class="task-details">
                    <p><strong>Time:</strong> ${timeString}</p>
                    <p><strong>Priority:</strong> ${task.priority}</p>
                    ${
                      task.tags?.length
                        ? `<p><strong>Categories:</strong> ${task.tags.join(
                            ", "
                          )}</p>`
                        : ""
                    }
                    ${
                      task.reminder
                        ? `<p><strong>Reminder:</strong> ${task.reminder} minutes before</p>`
                        : ""
                    }
                    ${
                      task.notes
                        ? `<p><strong>Notes:</strong> ${task.notes}</p>`
                        : ""
                    }
                </div>
            </li>
        `;
  }
}
