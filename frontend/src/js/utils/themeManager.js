export class ThemeManager {
  constructor() {
    this.init();
  }

  init() {
    // Create theme dots
    this.createThemeDots();

    // Check system preference
    this.systemPreference = window.matchMedia("(prefers-color-scheme: dark)");

    // Get saved theme or use system preference
    const savedTheme = localStorage.getItem("theme");
    this.currentTheme =
      savedTheme || (this.systemPreference.matches ? "dark" : "light");

    // Apply initial theme
    this.applyTheme(this.currentTheme);

    // Listen for system changes
    this.systemPreference.addEventListener("change", (e) => {
      if (!localStorage.getItem("theme")) {
        this.applyTheme(e.matches ? "dark" : "light");
      }
    });
  }

  createThemeDots() {
    const nav = document.querySelector(".header-nav ul");
    const li = document.createElement("li");
    li.className = "theme-dots";

    const lightDot = this.createDot("light");
    const darkDot = this.createDot("dark");

    li.appendChild(lightDot);
    li.appendChild(darkDot);
    nav.appendChild(li);
  }

  createDot(theme) {
    const dot = document.createElement("button");
    dot.className = `theme-dot ${theme}`;
    dot.setAttribute("aria-label", `Switch to ${theme} mode`);
    dot.addEventListener("click", () => this.applyTheme(theme));
    return dot;
  }

  applyTheme(theme) {
    this.currentTheme = theme;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    this.updateActiveDot();
  }

  updateActiveDot() {
    document.querySelectorAll(".theme-dot").forEach((dot) => {
      dot.classList.remove("active");
      if (dot.classList.contains(this.currentTheme)) {
        dot.classList.add("active");
      }
    });
  }
}
