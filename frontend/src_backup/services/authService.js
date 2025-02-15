// frontend/src/services/authService.js
import { createAuth0Client } from "@auth0/auth0-spa-js";
import { auth0Config } from "../config/auth0.config.js";

class AuthService {
  constructor() {
    // Initialize basic properties
    this.auth0Client = null; // Will hold Auth0 client instance
    this.isAuthenticated = false; // Track authentication state
    this.user = null; // Store user data when logged in
  }

  async init() {
    // Create Auth0 client using your config
    this.auth0Client = await createAuth0Client(auth0Config);

    // Handle redirect after login
    if (window.location.search.includes("code=")) {
      await this.handleRedirectCallback();
    }

    // Check if user is already logged in
    this.isAuthenticated = await this.auth0Client.isAuthenticated();
    this.user = this.isAuthenticated ? await this.auth0Client.getUser() : null;
  }

  async login() {
    await this.auth0Client.loginWithRedirect();
  }

  async logout() {
    await this.auth0Client.logout();
  }

  async handleRedirectCallback() {
    // Process Auth0's response after login
    await this.auth0Client.handleRedirectCallback();
    // Clean up URL after processing
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

export const authService = new AuthService();
