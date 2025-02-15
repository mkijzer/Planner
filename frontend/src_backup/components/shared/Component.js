// src/js/components/Component.js
export class Component {
  constructor(container, initialState = {}) {
    if (!container) {
      throw new Error("Container element is required");
    }
    this.container = container;
    this.state = initialState;
    // Remove this.initialize() from here
  }

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
