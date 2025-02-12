import { Component } from "../../../components/shared/Component.js";

export class TaskList extends Component {
  // 1. Constructor and Initialization
  constructor(container, taskService) {
    const initialState = {
      tasks: [],
      filter: "today",
    };

    // Validate inputs
    if (!container) {
      throw new Error("Container is required to create TaskList");
    }

    if (!taskService) {
      throw new Error("TaskService is required to create TaskList");
    }

    if (typeof taskService.getAllTasks !== "function") {
      throw new Error("Invalid TaskService: getAllTasks method is missing");
    }

    // Call parent constructor
    super(container, initialState);

    // Attach taskService
    this.taskService = taskService;

    // Set up listener for task updates
    this.unsubscribe = this.taskService.addListener((tasks) => {
      this.setState({ tasks });
    });

    // Initialize
    this.initializeTaskList();
  }

  async initializeTaskList() {
    try {
      await this.loadTasks();
      this.setupFilterButtons();
    } catch (error) {
      console.error("Error initializing TaskList:", error);
      this.container.innerHTML = `
        <div class="error-message">
          <p>Unable to load tasks. Please refresh the page or contact support.</p>
          <details>${error.message}</details>
        </div>
      `;
    }
  }

  initialize() {
    this.setupFilterButtons();
    this.loadTasks();
  }

  setupFilterButtons() {
    const filterButtons = document.querySelectorAll(".task-filter-btn");
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        filterButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
        this.setState({ filter: button.dataset.filter });
        this.loadTasks();
      });
    });
  }

  // 2. Core Task Operations
  async loadTasks() {
    try {
      const getAllTasks = this.taskService.getAllTasks.bind(this.taskService);
      const tasks = await getAllTasks();

      switch (this.state.filter) {
        case "today":
        case "upcoming":
          this.renderTasks(this.filterTasks(tasks));
          break;
        case "all":
          this.renderTasks(tasks);
          break;
        default:
          console.warn("Unknown filter:", this.state.filter);
          this.renderTasks(tasks);
      }
    } catch (error) {
      console.error("Error loading tasks in TaskList:", error);
      throw error;
    }
  }

  filterTasks(tasks) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (this.state.filter) {
      case "today":
        return tasks.filter((task) => {
          const taskDate = new Date(task.date);
          return (
            taskDate.getDate() === today.getDate() &&
            taskDate.getMonth() === today.getMonth() &&
            taskDate.getFullYear() === today.getFullYear()
          );
        });

      case "upcoming":
        return tasks.filter((task) => {
          const taskDate = new Date(task.date);
          return taskDate > today;
        });

      default:
        return tasks;
    }
  }

  // 3. Rendering Methods
  render() {
    const filteredTasks = this.filterTasks(this.state.tasks);

    if (filteredTasks.length === 0) {
      this.container.innerHTML = '<p class="no-tasks">No tasks found.</p>';
      return;
    }

    this.renderTasks(filteredTasks);
  }

  renderTasks(tasks) {
    const tasksList = document.createElement("div");
    tasksList.className = "tasks-list";

    tasks.forEach((task) => {
      const taskElement = this.createTaskElement(task);
      tasksList.appendChild(taskElement);
    });

    this.container.innerHTML = "";
    this.container.appendChild(tasksList);
  }

  createTaskElement(task) {
    const taskElement = this.createElementFromHTML(`
      <div class="sidebar-task-preview" data-task-id="${task.id}">
        <h4>${task.title}</h4>
        <time>${new Date(task.date).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })}</time>
        <div class="task-preview-priority ${task.priority}" 
             aria-label="Priority: ${task.priority}">
        </div>
      </div>
    `);

    taskElement.addEventListener("click", () => {
      document.dispatchEvent(
        new CustomEvent("openTaskDetails", { detail: { task } })
      );
    });

    return taskElement;
  }

  // 4. Cleanup
  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
