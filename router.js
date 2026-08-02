/**
 * Selfcare Diagnostics - SPA Router Engine
 * Handles Navigation, Dynamic View Loading & Role Guarding
 */

const Router = {
  routes: {},

  /**
   * Register Route Handler
   */
  addRoute(path, renderFunction, requiresAuth = false, allowedRoles = []) {
    this.routes[path] = {
      render: renderFunction,
      requiresAuth: requiresAuth,
      allowedRoles: allowedRoles
    };
  },

  /**
   * Initialize Hash Listener
   */
  init() {
    window.addEventListener("hashchange", () => this.handleRoute());
    this.handleRoute();
  },

  /**
   * Route Dispatcher
   */
  handleRoute() {
    let hash = window.location.hash.replace("#", "") || "home";
    let targetRoute = this.routes[hash];

    // Fallback if route doesn't exist
    if (!targetRoute) {
      hash = "home";
      targetRoute = this.routes["home"];
    }

    // Auth Guard Check
    if (targetRoute.requiresAuth && !Store.isAuthenticated()) {
      AppCore.showToast("Please login to access this section", "warning");
      this.navigate("login");
      return;
    }

    // Role Guard Check
    if (targetRoute.allowedRoles.length > 0) {
      const userRole = Store.getUserRole();
      if (!targetRoute.allowedRoles.includes(userRole)) {
        AppCore.showToast("Access Denied: Restricted Role", "error");
        this.navigate("home");
        return;
      }
    }

    // Update Active Navigation Highlight
    Store.state.currentRoute = hash;
    this.updateActiveNav(hash);

    // Render View
    const contentContainer = document.getElementById("main-content");
    if (contentContainer && typeof targetRoute.render === "function") {
      contentContainer.innerHTML = targetRoute.render();
      window.scrollTo(0, 0);
    }
  },

  /**
   * Programmatic Navigation
   */
  navigate(path) {
    window.location.hash = `#${path}`;
  },

  /**
   * Update Bottom Nav Item Active States
   */
  updateActiveNav(activeHash) {
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach((item) => {
      const route = item.getAttribute("data-route");
      if (route === activeHash) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });
  }
};

window.Router = Router;
