/**
 * Selfcare Diagnostics - Backend Global Configuration
 * Google Apps Script Server Side
 */

const CONFIG = {
  // Spreadsheet ID (Leave empty to use active spreadsheet attached to script)
  SPREADSHEET_ID: "", 
  
  // Security Tokens & Encryption Keys
  JWT_SECRET: "SelfcareDiagnostics_JWT_Super_Secret_Key_2026_Secure!",
  TOKEN_EXPIRY_HOURS: 168, // 7 days
  
  // Payment Integration
  RAZORPAY: {
    KEY_ID: "YOUR_RAZORPAY_KEY_ID",
    KEY_SECRET: "YOUR_RAZORPAY_KEY_SECRET"
  },
  
  // AI API Integration
  GEMINI: {
    API_KEY: "YOUR_GEMINI_API_KEY",
    MODEL: "gemini-1.5-flash"
  },
  
  // Firebase Cloud Messaging
  FCM: {
    SERVER_KEY: "YOUR_FCM_SERVER_KEY"
  },
  
  // App Defaults
  DEFAULT_BRANCH: "BR001",
  CURRENCY_SYMBOL: "₹"
};

/**
 * Helper to get the active Google Sheet instance
 */
function getDbSpreadsheet() {
  if (CONFIG.SPREADSHEET_ID && CONFIG.SPREADSHEET_ID !== "") {
    return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}
