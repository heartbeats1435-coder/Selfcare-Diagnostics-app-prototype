/**
 * Selfcare Diagnostics - Primary API Controller & Route Manager
 * Google Apps Script Web App Entry
 */

/**
 * Main Web App GET Request Entry
 */
function doGet(e) {
  const action = e.parameter.action;
  
  if (action === "ping") {
    return jsonResponse({ status: "success", message: "Selfcare Diagnostics API Service is Live!", timestamp: new Date().toISOString() });
  }

  if (action === "get_public_tests") {
    return jsonResponse(getPublicTests());
  }

  return jsonResponse({ status: "error", message: "Invalid GET endpoint action" }, 400);
}

/**
 * Main Web App POST Request Entry
 */
function doPost(e) {
  try {
    enforceSecurityCheck(e);

    // Existing doPost routing logic...
    if (!e.postData || !e.postData.contents) {
      return jsonResponse({ status: "error", message: "Empty request body" }, 400);
    }

    const request = JSON.parse(e.postData.contents);
    const action = request.action;
    const payload = request.payload || {};
    const authHeader = request.authToken || "";

    // Route Actions
    switch (action) {
      // --- Auth Routes ---
      case "auth_register":
        return jsonResponse(handleRegister(payload));
      
      case "auth_login":
        return jsonResponse(handleLogin(payload));

      case "auth_google_login":
        return jsonResponse(handleGoogleLogin(payload));

      case "auth_verify_otp":
        return jsonResponse(handleVerifyOTP(payload));

      // --- Authenticated User Routes ---
      case "get_user_profile": {
        const user = verifyRequestToken(authHeader);
        if (!user) return jsonResponse({ status: "error", message: "Unauthorized token" }, 401);
        return jsonResponse(getUserProfile(user.userId));
      }

      case "update_user_profile": {
        const user = verifyRequestToken(authHeader);
        if (!user) return jsonResponse({ status: "error", message: "Unauthorized token" }, 401);
        return jsonResponse(updateUserProfile(user.userId, payload));
      }
      case "create_booking": {
  const user = verifyRequestToken(authHeader);

  return jsonResponse(
    handleCreateBooking({
      ...payload,
      customerId: user ? user.userId : "GUEST"
    })
  );
}      
      case "get_customer_reports": {
        const user = verifyRequestToken(authHeader);
        if (!user) return jsonResponse({ status: "error", message: "Unauthorized token" }, 401);
        return jsonResponse(handleGetCustomerReports(user.userId));
      }
      case "get_technician_bookings": {
  const user = verifyRequestToken(authHeader);

  return jsonResponse(
    handleGetTechnicianBookings(
      user ? user.userId : "TECH001"
    )
  );
}
      case "update_sample_status": {
  return jsonResponse(
    handleUpdateSampleStatus(payload)
  );
}
      case "get_admin_analytics": {
  const user = verifyRequestToken(authHeader);

  if (!user || (user.role !== "Admin" && user.role !== "Super Admin")) {
    return jsonResponse(
      {
        status: "error",
        message: "Forbidden: Admin privileges required"
      },
      403
    );
  }

  return jsonResponse(
    handleGetAdminAnalytics()
  );
}

     case "update_test_catalog": {
  const user = verifyRequestToken(authHeader);

  if (!user || (user.role !== "Admin" && user.role !== "Super Admin")) {
    return jsonResponse(
      {
        status: "error",
        message: "Forbidden"
      },
      403
    );
  }

  return jsonResponse(
    handleUpdateTestCatalog(payload)
  );
}
case "send_notification": {
  const user = verifyRequestToken(authHeader);

  if (!user) {
    return jsonResponse(
      {
        status: "error",
        message: "Unauthorized"
      },
      401
    );
  }

  return jsonResponse(
    handleSendNotification(payload)
  );
}

case "get_user_notifications": {
  const user = verifyRequestToken(authHeader);

  if (!user) {
    return jsonResponse(
      {
        status: "error",
        message: "Unauthorized"
      },
      401
    );
  }

  return jsonResponse(
    handleGetUserNotifications(user.userId)
  );
}
      default:
        return jsonResponse({ status: "error", message: "Unknown action: " + action }, 404);
    }

  } catch (err) {
    Logger.log("API Error: " + err.toString());
    return jsonResponse({ status: "error", message: "Server Exception: " + err.toString() }, 500);
  }
}

/**
 * Helper to construct JSON HTTP Response with CORS headers
 */
function jsonResponse(data, statusCode) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

/**
 * Public Test Catalog Retrieval
 */
function getPublicTests() {
  const ss = getDbSpreadsheet();
  const testSheet = ss.getSheetByName("Tests");
  const rows = testSheet.getDataRange().getValues();
  const headers = rows[0];
  
  const tests = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row[10] === "Active") { // Status
      let item = {};
      headers.forEach((h, index) => {
        item[h] = row[index];
      });
      tests.push(item);
    }
  }

  return { status: "success", data: tests };
}
