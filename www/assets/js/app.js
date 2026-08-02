/**
 * Selfcare Diagnostics - Main Core Client Application File
 * Handles Service Worker Registration, Lifecycle & Offline Listeners
 */

document.addEventListener("DOMContentLoaded", () => {
  console.log("Initializing Selfcare Diagnostics App v" + APP_CONFIG.VERSION);

  // Initialize App Modules
  AppCore.init();
});

const AppCore = {
  isOnline: navigator.onLine,

  init() {
    this.registerServiceWorker();
    this.bindNetworkEvents();
  },

  /**
   * Register PWA Service Worker
   */
  registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("./sw.js")
          .then((registration) => {
            console.log("[PWA] ServiceWorker registered with scope: ", registration.scope);
          })
          .catch((error) => {
            console.error("[PWA] ServiceWorker registration failed: ", error);
          });
      });
    }
  },

  /**
   * Monitor Network Connectivity Status
   */
  bindNetworkEvents() {
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.showToast("Back online! Syncing latest data...", "success");
      document.body.classList.remove("app-offline");
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
      this.showToast("You are currently offline. Working in offline mode.", "warning");
      document.body.classList.add("app-offline");
    });
  },

  /**
   * Global Toast Notification Display
   */
  showToast(message, type = "info") {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <span>${message}</span>
      </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("fade-out");
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
};

window.AppCore = AppCore;
