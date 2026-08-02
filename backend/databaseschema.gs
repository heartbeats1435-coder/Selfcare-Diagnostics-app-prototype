/**
 * Selfcare Diagnostics - Database Schema Engine & Seeder
 * Manages all 27 Sheet Tables, Column Schemas & Database Initialization
 */

const DATABASE_SCHEMA = {
  Users: [
    "User_ID", "Phone", "Email", "Password_Hash", "Role", 
    "Status", "Created_At", "Last_Login", "Push_Token"
  ],
  Customers: [
    "Customer_ID", "User_ID", "Full_Name", "Gender", "DOB", 
    "Blood_Group", "Address_Primary", "City", "Pincode", "Profile_Photo"
  ],
  FamilyMembers: [
    "Member_ID", "Customer_ID", "Full_Name", "Relation", 
    "Gender", "Age", "Blood_Group"
  ],
  Bookings: [
    "Booking_ID", "Customer_ID", "Patient_Type", "Family_Member_ID", 
    "Booking_Type", "Collection_Address", "Lat", "Lng", "Collection_Date", 
    "Time_Slot", "Total_Amount", "Discount_Amount", "Final_Amount", 
    "Payment_Status", "Payment_Mode", "Booking_Status", "Assigned_Technician_ID", "Created_At"
  ],
  BookingItems: [
    "Item_ID", "Booking_ID", "Item_Type", "Item_Reference_ID", 
    "Item_Name", "Price"
  ],
  Tests: [
    "Test_ID", "Test_Code", "Test_Name", "Category", "Description", 
    "Fasting_Required", "Sample_Type", "Turnaround_Time", "Price", "Discount_Price", "Status"
  ],
  Packages: [
    "Package_ID", "Package_Code", "Package_Name", "Category", "Description", 
    "Test_IDs", "Total_Tests_Count", "Fasting_Required", "Price", "Discount_Price", "Status"
  ],
  Offers: [
    "Offer_ID", "Title", "Banner_Url", "Target_Type", 
    "Discount_Percentage", "Start_Date", "End_Date", "Active"
  ],
  Coupons: [
    "Coupon_ID", "Code", "Discount_Type", "Value", "Min_Order_Value", 
    "Max_Discount", "Valid_From", "Valid_Till", "Usage_Limit", "Active"
  ],
  Payments: [
    "Payment_ID", "Booking_ID", "Razorpay_Order_ID", "Razorpay_Payment_ID", 
    "Razorpay_Signature", "Amount", "Method", "Status", "Created_At"
  ],
  Transactions: [
    "Transaction_ID", "User_ID", "Type", "Amount", 
    "Purpose", "Reference_ID", "Status", "Created_At"
  ],
  Reports: [
    "Report_ID", "Booking_ID", "Customer_ID", "Report_PDF_URL", 
    "AI_Summary", "Status", "Uploaded_At"
  ],
  Notifications: [
    "Notification_ID", "User_ID", "Title", "Message", 
    "Type", "Read_Status", "Created_At"
  ],
  Technicians: [
    "Technician_ID", "User_ID", "Full_Name", "Phone", "Vehicle_Number", 
    "Current_Lat", "Current_Lng", "Availability_Status", "Branch_ID"
  ],
  Attendance: [
    "Attendance_ID", "Technician_ID", "Date", "Check_In_Time", 
    "Check_Out_Time", "Status"
  ],
  Inventory: [
    "Item_ID", "Branch_ID", "Item_Name", "Category", 
    "Stock_Quantity", "Minimum_Required", "Unit"
  ],
  Branches: [
    "Branch_ID", "Branch_Name", "Code", "Address", "City", 
    "Pincode", "Contact_Phone", "Lat", "Lng"
  ],
  AuditLogs: [
    "Log_ID", "User_ID", "Action", "Entity", "Details", 
    "IP_Address", "Created_At"
  ],
  Settings: [
    "Setting_Key", "Setting_Value", "Description", "Updated_At"
  ],
  Feedback: [
    "Feedback_ID", "Booking_ID", "Customer_ID", "Rating", 
    "Comment", "Created_At"
  ],
  Wallet: [
    "Wallet_ID", "Customer_ID", "Balance", "Updated_At"
  ],
  RewardPoints: [
    "Point_ID", "Customer_ID", "Points", "Reason", 
    "Expiry_Date", "Created_At"
  ],
  Referrals: [
    "Referral_ID", "Referrer_User_ID", "Referred_Phone", 
    "Status", "Reward_Claimed", "Created_At"
  ],
  Appointments: [
    "Appointment_ID", "Booking_ID", "Technician_ID", 
    "Scheduled_Time", "Status"
  ],
  MedicalHistory: [
    "History_ID", "Customer_ID", "Condition", "Allergies", 
    "Surgeries", "Notes", "Updated_At"
  ],
  MedicineReminder: [
    "Reminder_ID", "Customer_ID", "Medicine_Name", "Dosage", 
    "Time_Slot", "Active"
  ],
  EmergencyContacts: [
    "Contact_ID", "Customer_ID", "Contact_Name", 
    "Relationship", "Phone"
  ]
};

/**
 * Run this function inside Google Apps Script Script Editor to automatically 
 * initialize all 27 tables and seed baseline system data.
 */
function initDatabase() {
  const ss = getDbSpreadsheet();
  Logger.log("Starting Database Schema Creation...");

  Object.keys(DATABASE_SCHEMA).forEach(sheetName => {
    let sheet = ss.getSheetByName(sheetName);
    const headers = DATABASE_SCHEMA[sheetName];

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      Logger.log("Created sheet: " + sheetName);
    }

    // Set Header Row if empty
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // Style Header Row
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#1E293B"); // Dark slate grey header
      headerRange.setFontColor("#FFFFFF");
      headerRange.setFontWeight("bold");
      sheet.setFrozenRows(1);
    }
  });

  // Remove default sheet if exists
  const defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
  }

  // Seed default data
  seedInitialSystemData(ss);
  
  Logger.log("Database Schema Initialized Successfully!");
  return "Database Setup Complete. All 27 Sheets initialized.";
}

/**
 * Seed initial administrative data, default branch, and settings
 */
function seedInitialSystemData(ss) {
  const now = new Date().toISOString();

  // 1. Seed Super Admin User
  const usersSheet = ss.getSheetByName("Users");
  if (usersSheet.getLastRow() <= 1) {
    usersSheet.appendRow([
      "USR_SUPER_001",
      "+919999999999",
      "admin@selfcarediagnostics.com",
      "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918", // SHA-256 for admin123
      "Super Admin",
      "Active",
      now,
      now,
      ""
    ]);
  }

  // 2. Seed Default Branch
  const branchSheet = ss.getSheetByName("Branches");
  if (branchSheet.getLastRow() <= 1) {
    branchSheet.appendRow([
      "BR001",
      "Central Diagnostics Hub - Chennai",
      "HUB-CHE",
      "123 Health Avenue, Anna Nagar",
      "Chennai",
      "600040",
      "+914420001111",
      "13.0827",
      "80.2707"
    ]);
  }

  // 3. Seed Base Tests
  const testSheet = ss.getSheetByName("Tests");
  if (testSheet.getLastRow() <= 1) {
    const baseTests = [
      ["TST001", "CBC01", "Complete Blood Count (CBC)", "Hematology", "Evaluates overall health and detects a wide range of disorders, including anemia and infection.", "No", "EDTA Blood", "24 Hours", "350", "299", "Active"],
      ["TST002", "FBS01", "Fasting Blood Sugar (FBS)", "Diabetic Care", "Measures blood glucose levels after fasting to screen for diabetes.", "Yes (8-10 hrs)", "Fluoride Plasma", "12 Hours", "150", "99", "Active"],
      ["TST003", "LFT01", "Liver Function Test (LFT)", "Biochemistry", "Assesses the overall health and function of the liver.", "Yes (8 hrs)", "Serum", "24 Hours", "850", "699", "Active"],
      ["TST004", "KFT01", "Kidney Function Test (KFT)", "Biochemistry", "Evaluates kidney function including Creatinine and Urea levels.", "No", "Serum", "24 Hours", "800", "649", "Active"],
      ["TST005", "THY01", "Thyroid Profile (T3, T4, TSH)", "Endocrinology", "Checks thyroid gland activity and hormone levels.", "No", "Serum", "24 Hours", "600", "499", "Active"]
    ];
    baseTests.forEach(test => testSheet.appendRow(test));
  }

  // 4. Seed Settings
  const settingsSheet = ss.getSheetByName("Settings");
  if (settingsSheet.getLastRow() <= 1) {
    const settings = [
      ["APP_NAME", "Selfcare Diagnostics", "Application Display Name", now],
      ["CURRENCY", "INR", "Transaction Currency", now],
      ["MIN_HOME_COLLECTION_FREE_LIMIT", "500", "Free Home Collection above this cart value", now],
      ["HOME_COLLECTION_CHARGE", "100", "Standard home collection fee", now],
      ["ALLOW_GUEST_BOOKING", "TRUE", "Toggle guest checkout", now]
    ];
    settings.forEach(setting => settingsSheet.appendRow(setting));
  }
}
