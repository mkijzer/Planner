// src/js/components/tasks/TaskModal.js
export class TaskModal {
  constructor(taskManager) {
    this.taskManager = taskManager;
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
    document.addEventListener("openTaskModal", (e) => {
      const { date, hour } = e.detail;
      this.openTaskModal(date, hour);
    });

    document.addEventListener("editTask", (e) => {
      const { task } = e.detail;
      this.openEditForm(task);
    });

    document.addEventListener("deleteTask", (e) => {
      const { taskId } = e.detail;
      this.taskManager.deleteTask(taskId);
      this.modal.classList.remove("show");
    });

    document.addEventListener("openTaskDetails", (e) => {
      const { task } = e.detail;
      this.openTaskDetails(task);
    });

    document.getElementById("show-task-form")?.addEventListener("click", () => {
      this.showTaskForm();
    });

    const modalCloseButton = this.modal.querySelector(".modal-close");
    if (modalCloseButton) {
      modalCloseButton.addEventListener("click", () => {
        this.closeModal();
      });
    }

    const taskForm = document.getElementById("task-form");
    if (taskForm) {
      taskForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleTaskSubmit();
      });
    }
  }

  setupFormHandlers() {
    const priorityContainer = document.querySelector(".priority-buttons");
    if (priorityContainer) {
      // Remove old listeners first
      const newPriorityContainer = priorityContainer.cloneNode(true);
      priorityContainer.parentNode.replaceChild(
        newPriorityContainer,
        priorityContainer
      );

      newPriorityContainer.addEventListener("click", (e) => {
        const priorityBtn = e.target.closest(".priority-btn");
        if (priorityBtn) {
          // Remove selected class from all buttons
          newPriorityContainer
            .querySelectorAll(".priority-btn")
            .forEach((btn) => {
              btn.classList.remove("selected");
            });
          // Add selected class to clicked button
          priorityBtn.classList.add("selected");
        }
      });
    }

    const reminderContainer = document.querySelector(".reminder-buttons");
    if (reminderContainer) {
      reminderContainer.addEventListener("click", (e) => {
        const reminderBtn = e.target.closest(".reminder-btn");
        if (reminderBtn) {
          reminderContainer.querySelectorAll(".reminder-btn").forEach((btn) => {
            btn.classList.remove("selected");
          });
          reminderBtn.classList.add("selected");
        }
      });
    }

    const tagInput = document.getElementById("taskCategory");
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

  openTaskModal(date, hour) {
    this.updateModalDate(date, hour);
    this.resetForm();
    this.setupTimeInput(hour);
    this.setupTaskForm(date);
    this.showTaskForm();
    this.showModal();
  }

  setupTimeInput(hour) {
    const taskTimeInput = document.getElementById("taskTime");
    if (taskTimeInput) {
      const hourStr = hour.toString().padStart(2, "0");
      taskTimeInput.value = `${hourStr}:00`;
    }
  }

  setupTaskForm(date) {
    this._currentDate = date;
  }

  handleTaskSubmit() {
    const taskTitle = document.getElementById("taskTitle").value;
    if (!taskTitle.trim()) return;

    const taskDate = new Date(this._currentDate);
    const timeInput = document.getElementById("taskTime");
    const [hours, minutes] = timeInput.value.split(":").map(Number);
    taskDate.setHours(hours, minutes, 0, 0);

    const taskData = {
      id: Date.now().toString(),
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

    this.taskManager.addTask(taskData);
    this.closeModal();
  }

  openEditForm(task) {
    this.populateFormWithTaskData(task);
    this.modifyFormSubmissionForEdit(task.id);
    this.showTaskForm();
  }

  populateFormWithTaskData(task) {
    document.getElementById("taskTitle").value = task.title;
    document.getElementById("taskTime").value = new Date(task.date)
      .toTimeString()
      .slice(0, 5);
    document.getElementById("taskNotes").value = task.notes || "";

    // Set priority
    document
      .querySelector(`.priority-btn[data-priority="${task.priority}"]`)
      ?.classList.add("selected");

    // Set tags
    const tagsContainer = document.getElementById("selectedTags");
    tagsContainer.innerHTML = "";
    task.tags?.forEach((tag) => this.addTag(tag));
  }

  modifyFormSubmissionForEdit(taskId) {
    const taskForm = document.getElementById("task-form");
    taskForm.onsubmit = (e) => {
      e.preventDefault();
      this.handleEditSubmit(taskId);
    };
  }

  handleEditSubmit(taskId) {
    const taskTitle = document.getElementById("taskTitle").value;
    if (!taskTitle.trim()) return;

    const taskDate = new Date(this._currentDate || new Date());
    const timeInput = document.getElementById("taskTime");
    const [hours, minutes] = timeInput.value.split(":").map(Number);
    taskDate.setHours(hours, minutes, 0, 0);

    const taskData = {
      id: taskId,
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

    this.taskManager.editTask(taskData);
    this.closeModal();
  }

  openTaskDetails(task) {
    this.updateModalDateWithTaskDetails(task);
    this.populateTaskDetailsView(task);
    this.showTaskDetails();
    this.showModal();
  }

  updateModalDateWithTaskDetails(task) {
    const taskDate = new Date(task.date);
    const hours = taskDate.getHours();
    const minutes = taskDate.getMinutes();
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const timeString = `${displayHours}:${minutes
      .toString()
      .padStart(2, "0")} ${period}`;

    this.modalDate.textContent = `${taskDate.toDateString()} at ${timeString}`;
  }

  populateTaskDetailsView(task) {
    const taskListContainer = document.getElementById("task-list-container");
    taskListContainer.innerHTML = this.generateTaskDetailsHTML(task);

    // Add event listeners for edit and delete buttons
    taskListContainer
      .querySelector(".edit-task")
      ?.addEventListener("click", (e) => {
        const task = JSON.parse(e.target.dataset.task);
        this.openEditForm(task);
      });

    taskListContainer
      .querySelector(".delete-task")
      ?.addEventListener("click", (e) => {
        const taskId = e.target.dataset.taskId;
        this.taskManager.deleteTask(taskId);
        this.closeModal();
      });
  }

  generateTaskDetailsHTML(task) {
    return `
      <li class="task-list-item">
        <div class="task-header">
          <h3>${task.title}</h3>
          <div class="task-actions">
            <button class="edit-task" data-task='${JSON.stringify(
              task
            )}'>Edit</button>
            <button class="delete-task" data-task-id="${
              task.id
            }">Delete</button>
          </div>
        </div>
        <div class="task-details">
          <p><strong>Time:</strong> ${this.getTimeString(task.date)}</p>
          <p><strong>Priority:</strong> ${task.priority}</p>
          ${
            task.tags?.length
              ? `<p><strong>Categories:</strong> ${task.tags.join(", ")}</p>`
              : ""
          }
          ${
            task.reminder
              ? `<p><strong>Reminder:</strong> ${task.reminder} minutes before</p>`
              : ""
          }
          ${task.notes ? `<p><strong>Notes:</strong> ${task.notes}</p>` : ""}
        </div>
      </li>
    `;
  }

  getTimeString(date) {
    const taskDate = new Date(date);
    const hours = taskDate.getHours();
    const minutes = taskDate.getMinutes();
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

  showTaskForm() {
    this.tasksView.classList.add("hidden");
    this.addTaskForm.classList.remove("hidden");
  }

  showTaskDetails() {
    this.tasksView.classList.remove("hidden");
    this.addTaskForm.classList.add("hidden");
  }

  resetForm() {
    document.getElementById("taskTitle").value = "";
    document.getElementById("taskNotes").value = "";
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
