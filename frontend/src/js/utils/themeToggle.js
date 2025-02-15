// src/js/utils/themeToggle.js

export class ThemeToggle {
  constructor() {
    // Check system preference first
    this.systemPreference = window.matchMedia("(prefers-color-scheme: dark)");

    // Get saved preference or use system preference
    this.theme =
      localStorage.getItem("theme") ||
      (this.systemPreference.matches ? "dark" : "light");

    this.initialize();
    this.setupSystemPreferenceListener();
  }

  initialize() {
    document.documentElement.setAttribute("data-theme", this.theme);
    this.updateActiveToggle();
  }

  setupSystemPreferenceListener() {
    // Listen for system preference changes
    this.systemPreference.addEventListener("change", (e) => {
      if (!localStorage.getItem("theme")) {
        this.theme = e.matches ? "dark" : "light";
        this.initialize();
      }
    });
  }

  createToggles() {
    const container = document.createElement("div");
    container.className = "theme-toggle-container";

    const lightToggle = document.createElement("button");
    lightToggle.className = "theme-toggle light";
    lightToggle.setAttribute("aria-label", "Switch to light mode");

    const darkToggle = document.createElement("button");
    darkToggle.className = "theme-toggle dark";
    darkToggle.setAttribute("aria-label", "Switch to dark mode");

    lightToggle.addEventListener("click", () => this.setTheme("light"));
    darkToggle.addEventListener("click", () => this.setTheme("dark"));

    container.appendChild(lightToggle);
    container.appendChild(darkToggle);

    return container;
  }

  setTheme(newTheme) {
    this.theme = newTheme;
    document.documentElement.setAttribute("data-theme", this.theme);
    localStorage.setItem("theme", this.theme);
    this.updateActiveToggle();
  }

  updateActiveToggle() {
    const lightToggle = document.querySelector(".theme-toggle.light");
    const darkToggle = document.querySelector(".theme-toggle.dark");

    if (lightToggle && darkToggle) {
      lightToggle.classList.toggle("active", this.theme === "light");
      darkToggle.classList.toggle("active", this.theme === "dark");
    }
  }
}
