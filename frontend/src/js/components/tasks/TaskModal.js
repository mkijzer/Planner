import { formatTime } from "../../modules/calendar/DateUtils.js";

export class TaskModal {
  constructor(taskManager) {
    this.taskManager = taskManager;
    this.modal = document.getElementById("taskModal");
    this.tasksView = document.getElementById("tasks-view");
    this.addTaskForm = document.getElementById("add-task-form");

    // Update element references to match new HTML
    this.modalHeading = document.getElementById("modal-heading");
    this.taskDateEl = document.getElementById("task-date");
    this.taskTimeEl = document.getElementById("task-time");
    this.taskReminder = document.getElementById("task-reminder");
    this.taskNotes = document.getElementById("task-notes");

    if (!this.modal || !this.tasksView || !this.addTaskForm) {
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
      if (confirm("Are you sure you want to delete this task?")) {
        this.taskManager.deleteTask(taskId);
        this.closeModal();
      }
    });

    document.addEventListener("openTaskDetails", (e) => {
      const { task } = e.detail;
      this.openTaskDetails(task);
    });

    document.getElementById("show-task-form")?.addEventListener("click", () => {
      this.showTaskForm();
    });

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

  showModal() {
    this.modal.classList.add("show");
    this.modal.setAttribute("aria-hidden", "false");
  }

  closeModal() {
    this.modal.classList.remove("show");
    this.modal.setAttribute("aria-hidden", "true");
    this.resetForm();
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
    const form = document.getElementById("task-form");
    if (form) {
      form.reset();
      document.getElementById("selectedTags").innerHTML = "";
      document
        .querySelectorAll(".priority-btn, .reminder-btn")
        .forEach((btn) => btn.classList.remove("selected"));
    }
  }

  openTaskModal(date, hour) {
    this._currentDate = date;
    this.resetForm();

    const taskTimeInput = document.getElementById("taskTime");
    if (taskTimeInput) {
      const hourStr = hour.toString().padStart(2, "0");
      taskTimeInput.value = `${hourStr}:00`;
    }

    if (this.taskDateEl) {
      this.taskDateEl.textContent = this.formatDate(date);
    }
    if (this.taskTimeEl) {
      this.taskTimeEl.textContent = formatTime(new Date().setHours(hour, 0, 0));
    }

    this.showTaskForm();
    this.showModal();
  }

  openTaskDetails(task) {
    if (this.modalHeading) {
      this.modalHeading.textContent = task.title;
    }

    const date = new Date(task.date);

    if (this.taskDateEl) {
      this.taskDateEl.textContent = this.formatDate(date);
    }
    if (this.taskTimeEl) {
      this.taskTimeEl.textContent = formatTime(task.date);
    }
    if (this.taskNotes) {
      this.taskNotes.textContent = task.notes || "No notes added";
    }

    // Setup edit/delete buttons
    const editBtn = this.modal.querySelector(".edit-btn");
    const deleteBtn = this.modal.querySelector(".delete-btn");

    editBtn?.addEventListener("click", () => this.openEditForm(task));
    deleteBtn?.addEventListener("click", () => {
      if (confirm("Are you sure you want to delete this task?")) {
        this.taskManager.deleteTask(task.id);
        this.closeModal();
      }
    });

    this.showTaskDetails();
    this.showModal();
  }

  openEditForm(task) {
    // Store current task data for editing
    this._currentTaskId = task.id;
    this._currentDate = new Date(task.date);

    // Update modal header
    if (this.modalHeading) {
      this.modalHeading.textContent = "Edit Task";
    }

    // Populate form with task data
    document.getElementById("taskTitle").value = task.title;
    document.getElementById("taskTime").value = new Date(task.date)
      .toTimeString()
      .slice(0, 5);
    document.getElementById("taskNotes").value = task.notes || "";

    // Set priority
    if (task.priority) {
      document
        .querySelector(`.priority-btn[data-priority="${task.priority}"]`)
        ?.classList.add("selected");
    }

    // Set reminder
    if (task.reminder) {
      document
        .querySelector(`.reminder-btn[data-time="${task.reminder}"]`)
        ?.classList.add("selected");
    }

    // Set tags
    const tagsContainer = document.getElementById("selectedTags");
    tagsContainer.innerHTML = "";
    task.tags?.forEach((tag) => this.addTag(tag));

    // Update form submission handler for edit mode
    const taskForm = document.getElementById("task-form");
    if (taskForm) {
      taskForm.onsubmit = (e) => {
        e.preventDefault();
        this.handleEditSubmit(this._currentTaskId);
      };
    }

    // Show form
    this.showTaskForm();
    this.showModal();
  }

  handleTaskSubmit() {
    const taskTitle = document.getElementById("taskTitle").value;
    if (!taskTitle.trim()) return;

    const taskData = {
      id: Date.now().toString(),
      title: taskTitle,
      date: new Date(this._currentDate),
      priority:
        document.querySelector(".priority-btn.selected")?.dataset.priority ||
        "low",
      reminder: document.querySelector(".reminder-btn.selected")?.dataset.time,
      notes: document.getElementById("taskNotes").value,
      tags: Array.from(document.querySelectorAll(".tag")).map(
        (tag) => tag.dataset.value
      ),
    };

    const timeInput = document.getElementById("taskTime");
    if (timeInput?.value) {
      const [hours, minutes] = timeInput.value.split(":").map(Number);
      taskData.date.setHours(hours, minutes);
    }

    this.taskManager.addTask(taskData);
    this.closeModal();
  }

  handleEditSubmit(taskId) {
    const taskTitle = document.getElementById("taskTitle").value;
    if (!taskTitle.trim()) return;

    const taskDate = new Date(this._currentDate);
    const timeInput = document.getElementById("taskTime");
    if (timeInput?.value) {
      const [hours, minutes] = timeInput.value.split(":").map(Number);
      taskDate.setHours(hours, minutes);
    }

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

    this.taskManager.updateTask(taskId, taskData);
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
