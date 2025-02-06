import { Component } from "../Component.js";

export class TaskList extends Component {
  constructor(container, taskService) {
    const initialState = {
      tasks: [],
      filter: "today",
    };

    super(container, initialState);

    if (!taskService) {
      throw new Error("TaskService is required");
    }
    this.taskService = taskService;

    this.unsubscribe = this.taskService.addListener((tasks) => {
      this.setState({ tasks });
    });

    this.initialize();
  }

  async loadTasks() {
    try {
      const tasks = await this.taskService.getAllTasks();
      switch (this.state.filter) {
        case "today":
          this.renderTasks(this.filterTasks(tasks));
          break;
        case "upcoming":
          this.renderTasks(this.filterTasks(tasks));
          break;
        case "all":
          this.renderTasks(tasks);
          break;
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
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

  render() {
    const filteredTasks = this.filterTasks(this.state.tasks);

    if (filteredTasks.length === 0) {
      this.container.innerHTML = '<p class="no-tasks">No tasks found.</p>';
      return;
    }

    this.renderTasks(filteredTasks);
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

  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
