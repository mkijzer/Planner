// src/js/components/Component.js
export class Component {
  constructor(container, initialState = {}) {
    // Add initialState parameter with default empty object
    if (!container) {
      throw new Error("Container element is required");
    }
    this.container = container;
    this.state = initialState; // Use the passed initialState
    this.initialize();
  }

  // Rest stays the same
  initialize() {
    this.render();
    this.setupEventListeners();
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }

  render() {
    throw new Error("render() method must be implemented");
  }

  setupEventListeners() {
    // Implement in child components if needed
  }

  createElementFromHTML(htmlString) {
    const div = document.createElement("div");
    div.innerHTML = htmlString.trim();
    return div.firstChild;
  }
}
