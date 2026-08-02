/**
 * Selfcare Diagnostics - Core Application Configuration
 * Production Ready Environment
 */

const APP_CONFIG = Object.freeze({
  APP_NAME: "Selfcare Diagnostics",
  APP_TAGLINE: "Empowering Wellness",
  VERSION: "1.0.0",
  BUILD_NUMBER: "20260802",
  
  // Backend Google Apps Script Web App URL (Update after deployment in Step 3)
  APPS_SCRIPT_URL: https://script.google.com/macros/s/AKfycbxwge-ZUFkcShcUfFkgDfWGMoq6rOp8FUchyMVCKnh_GAxk-cavHbMkQMEB4V4-KMWH/exec,
  
  // AI Integration (Google Gemini API)
  GEMINI_API_KEY: "YOUR_GEMINI_API_KEY_HERE",
  GEMINI_MODEL: "gemini-1.5-flash",
  
  // Payment Gateways
  RAZORPAY_KEY_ID: "YOUR_RAZORPAY_KEY_ID_HERE",
  CURRENCY: "INR",
  
  // Google Maps API
  GOOGLE_MAPS_API_KEY: "YOUR_GOOGLE_MAPS_API_KEY_HERE",
  
  // Languages Supported
  DEFAULT_LANGUAGE: "en",
  SUPPORTED_LANGUAGES: ["en", "ta"], // English, Tamil
  
  // Storage Keys
  STORAGE_KEYS: {
    AUTH_TOKEN: "sc_auth_token",
    USER_DATA: "sc_user_data",
    CART: "sc_cart_items",
    THEME: "sc_theme_mode",
    LANGUAGE: "sc_language",
    OFFLINE_QUEUE: "sc_offline_queue"
  },
  
  // Roles
  ROLES: {
    GUEST: "Guest",
    CUSTOMER: "Customer",
    TECHNICIAN: "Technician",
    ADMIN: "Admin",
    SUPER_ADMIN: "Super Admin"
  },
  
  // Default Location (Chennai, TN)
  DEFAULT_LOCATION: {
    lat: 13.0827,
    lng: 80.2707,
    city: "Chennai"
  }
});

// Freeze configuration to prevent tampering
if (typeof window !== "undefined") {
  window.APP_CONFIG = APP_CONFIG;
}
