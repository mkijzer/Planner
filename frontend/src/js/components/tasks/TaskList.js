// src/js/components/tasks/TaskList.js
import { Component } from "../Component.js";

export class TaskList extends Component {
  constructor(container, taskService) {
    super(container, {
      tasks: [],
      filter: "today",
    });
    this.taskService = taskService;
    this.unsubscribe = this.taskService.addListener((tasks) => {
      this.setState({ tasks });
    });
  }

  initialize() {
    if (!this.container.querySelector(".tasks-list")) {
      this.container.innerHTML = `
       <div class="task-filters">
         <button class="task-filter-btn active" data-filter="today">Today</button>
         <button class="task-filter-btn" data-filter="upcoming">Upcoming</button>
         <button class="task-filter-btn" data-filter="all">All Tasks</button>
       </div>
       <div class="tasks-list"></div>
     `;
    }
    this.setupFilterButtons();
    this.render();
  }

  setupEventListeners() {
    const filterButtons = this.container.querySelectorAll(".task-filter-btn");
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        filterButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
        this.setState({ filter: button.dataset.filter });
      });
    });

    this.container
      .querySelectorAll(".sidebar-task-preview")
      .forEach((taskEl) => {
        taskEl.addEventListener("click", () => {
          const taskId = taskEl.dataset.taskId;
          const task = this.state.tasks.find((t) => t.id === taskId);
          if (task) {
            document.dispatchEvent(
              new CustomEvent("openTaskDetails", {
                detail: { task },
              })
            );
          }
        });
      });
  }

  setupFilterButtons() {
    const filterButtons = this.container.querySelectorAll(".task-filter-btn");
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        filterButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
        this.setState({
          filter: button.dataset.filter,
        });
      });
    });
  }

  render() {
    const tasksContainer = this.container.querySelector(".tasks-list");
    if (!tasksContainer) return;

    const filteredTasks = this.filterTasks(this.state.tasks);
    tasksContainer.innerHTML = "";

    if (filteredTasks.length === 0) {
      tasksContainer.innerHTML = '<p class="no-tasks">No tasks found.</p>';
      return;
    }

    const sortedTasks = filteredTasks.sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    sortedTasks.forEach((task) => {
      const taskElement = this.createTaskElement(task);
      tasksContainer.appendChild(taskElement);
    });
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

      default: // 'all'
        return tasks;
    }
  }

  createTaskElement(task) {
    const taskElement = this.createElementFromHTML(`
     <div class="sidebar-task-preview" data-task-id="${task.id}">
       <h4>${task.title}</h4>
       <time>${new Date(task.date).toLocaleTimeString("en-US", {
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
