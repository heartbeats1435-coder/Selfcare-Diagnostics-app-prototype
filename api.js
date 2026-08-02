/**
 * Selfcare Diagnostics - Backend API Client Engine
 * Asynchronous Network Wrapper for Google Apps Script Backend
 */

const API = {
  /**
   * Execute POST requests to Google Apps Script Endpoint
   */
  async post(action, payload = {}) {
    const endpoint = APP_CONFIG.APPS_SCRIPT_URL;

    if (!endpoint || endpoint.includes("YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL")) {
      console.warn("[API] Google Apps Script URL not configured in config.js");
      return { status: "error", message: "API endpoint URL is missing." };
    }

    const requestBody = {
      action: action,
      authToken: Store.state.token || "",
      payload: payload
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8" // GAS CORS requirement
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP Error Status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("[API Error]:", error);
      return {
        status: "error",
        message: "Unable to connect to service. Please check network connection."
      };
    }
  },

  /**
   * Execute GET requests to Google Apps Script Endpoint
   */
  async get(action, params = {}) {
    let url = new URL(APP_CONFIG.APPS_SCRIPT_URL);
    url.searchParams.append("action", action);

    Object.keys(params).forEach((key) => {
      url.searchParams.append(key, params[key]);
    });

    try {
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error(`HTTP Error Status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("[API GET Error]:", error);
      return { status: "error", message: "Network fetch failed." };
    }
  }
};

window.API = API;
