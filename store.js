/**
 * Selfcare Diagnostics - Application Reactive State Store
 * Manages Auth Tokens, Cart Items, Theme, User Profile & Offline Sync Queue
 */

const Store = {
  state: {
    token: localStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN) || null,
    user: JSON.parse(localStorage.getItem(APP_CONFIG.STORAGE_KEYS.USER_DATA) || "null"),
    cart: JSON.parse(localStorage.getItem(APP_CONFIG.STORAGE_KEYS.CART) || "[]"),
    theme: localStorage.getItem(APP_CONFIG.STORAGE_KEYS.THEME) || "light",
    language: localStorage.getItem(APP_CONFIG.STORAGE_KEYS.LANGUAGE) || APP_CONFIG.DEFAULT_LANGUAGE,
    currentRoute: "home",
    selectedLocation: APP_CONFIG.DEFAULT_LOCATION,
    offlineQueue: JSON.parse(localStorage.getItem(APP_CONFIG.STORAGE_KEYS.OFFLINE_QUEUE) || "[]")
  },

  listeners: [],

  /**
   * Subscribe to state updates
   */
  subscribe(listener) {
    this.listeners.push(listener);
  },

  /**
   * Notify subscribers of state changes
   */
  notify() {
    this.listeners.forEach((listener) => listener(this.state));
  },

  // --- Auth State Handlers ---
  setAuth(token, user) {
    this.state.token = token;
    this.state.user = user;
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN, token);
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    this.notify();
  },

  clearAuth() {
    this.state.token = null;
    this.state.user = null;
    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER_DATA);
    this.notify();
  },

  isAuthenticated() {
    return !!this.state.token;
  },

  getUserRole() {
    return this.state.user ? this.state.user.role : APP_CONFIG.ROLES.GUEST;
  },

  // --- Cart Handlers ---
  addToCart(item) {
    const existingIndex = this.state.cart.findIndex((c) => c.id === item.id && c.type === item.type);
    if (existingIndex === -1) {
      this.state.cart.push(item);
      this.syncCart();
      return true;
    }
    return false;
  },

  removeFromCart(itemId, itemType) {
    this.state.cart = this.state.cart.filter((c) => !(c.id === itemId && c.type === itemType));
    this.syncCart();
  },

  clearCart() {
    this.state.cart = [];
    this.syncCart();
  },

  getCartTotal() {
    return this.state.cart.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);
  },

  syncCart() {
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.CART, JSON.stringify(this.state.cart));
    this.notify();
  },

  // --- Theme Handler ---
  setTheme(theme) {
    this.state.theme = theme;
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.THEME, theme);
    document.documentElement.setAttribute("data-theme", theme);
    this.notify();
  },

  toggleTheme() {
    const nextTheme = this.state.theme === "light" ? "dark" : "light";
    this.setTheme(nextTheme);
  },

  // --- Initialize App Theme on Boot ---
  initTheme() {
    document.documentElement.setAttribute("data-theme", this.state.theme);
  }
};

window.Store = Store;
