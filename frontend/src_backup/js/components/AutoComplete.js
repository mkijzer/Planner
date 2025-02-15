import { Component } from "../Component.js";

export class AutoComplete extends Component {
  constructor(container, options = []) {
    super(container, {
      suggestions: options,
      filteredSuggestions: [],
      selectedIndex: -1,
      showSuggestions: false,
      inputValue: "",
    });

    this.input = null;
    this.suggestionsContainer = null;
    this.createAutocomplete();
  }

  createAutocomplete() {
    // Create input
    this.input = document.createElement("input");
    this.input.type = "text";
    this.input.className = "tag-input";
    this.input.placeholder = "Add category...";

    // Create suggestions container
    this.suggestionsContainer = document.createElement("div");
    this.suggestionsContainer.className = "suggestions-container";

    // Add to container
    this.container.appendChild(this.input);
    this.container.appendChild(this.suggestionsContainer);

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.input.addEventListener("input", (e) => this.handleInput(e));
    this.input.addEventListener("keydown", (e) => this.handleKeydown(e));
    document.addEventListener("click", (e) => this.handleClickOutside(e));
  }

  handleInput(e) {
    const value = e.target.value;
    this.setState({
      inputValue: value,
      filteredSuggestions: this.filterSuggestions(value),
      selectedIndex: -1,
      showSuggestions: true,
    });
  }

  filterSuggestions(value) {
    const inputValue = value.toLowerCase();
    return this.state.suggestions.filter((suggestion) =>
      suggestion.toLowerCase().includes(inputValue)
    );
  }

  handleKeydown(e) {
    const { selectedIndex, filteredSuggestions } = this.state;

    switch (e.key) {
      case "Enter":
        if (selectedIndex >= 0) {
          e.preventDefault();
          this.selectSuggestion(filteredSuggestions[selectedIndex]);
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        this.setState({
          selectedIndex: Math.min(
            selectedIndex + 1,
            filteredSuggestions.length - 1
          ),
          showSuggestions: true,
        });
        break;
      case "ArrowUp":
        e.preventDefault();
        this.setState({
          selectedIndex: Math.max(selectedIndex - 1, -1),
          showSuggestions: true,
        });
        break;
      case "Escape":
        this.setState({
          showSuggestions: false,
          selectedIndex: -1,
        });
        break;
    }
  }

  handleClickOutside(e) {
    if (!this.container.contains(e.target)) {
      this.setState({ showSuggestions: false });
    }
  }

  selectSuggestion(suggestion) {
    this.input.value = suggestion;
    this.setState({
      inputValue: suggestion,
      showSuggestions: false,
      selectedIndex: -1,
    });
    // Dispatch event for parent components
    this.container.dispatchEvent(
      new CustomEvent("suggestionSelected", {
        detail: { value: suggestion },
      })
    );
  }

  render() {
    const { filteredSuggestions, showSuggestions, selectedIndex } = this.state;

    if (!showSuggestions || filteredSuggestions.length === 0) {
      this.suggestionsContainer.style.display = "none";
      return;
    }

    this.suggestionsContainer.style.display = "block";
    this.suggestionsContainer.innerHTML = filteredSuggestions
      .map(
        (suggestion, index) => `
                <div class="suggestion-item ${
                  index === selectedIndex ? "selected" : ""
                }"
                     role="option"
                     aria-selected="${index === selectedIndex}"
                     data-index="${index}">
                    ${suggestion}
                </div>
            `
      )
      .join("");

    // Add click listeners to suggestions
    this.suggestionsContainer
      .querySelectorAll(".suggestion-item")
      .forEach((item) => {
        item.addEventListener("click", () => {
          this.selectSuggestion(filteredSuggestions[item.dataset.index]);
        });
      });
  }
}
