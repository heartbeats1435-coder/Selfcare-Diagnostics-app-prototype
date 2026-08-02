/**
 * Selfcare Diagnostics - Authentication Engine & JWT Handler
 */

/**
 * Cryptographic Hashing for Passwords (SHA-256)
 */
function hashPassword(password) {
  const rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password, Utilities.Charset.UTF_8);
  let txtHash = "";
  for (let j = 0; j < rawHash.length; j++) {
    let pad = (rawHash[j] < 0 ? rawHash[j] + 256 : rawHash[j]).toString(16);
    txtHash += (pad.length === 1 ? "0" + pad : pad);
  }
  return txtHash;
}

/**
 * Custom HMAC-SHA256 Base64URL JWT Generator
 */
function generateJWT(payload) {
  const header = { alg: "HS256", typ: "JWT" };
  
  // Set expiration
  payload.exp = Math.floor(Date.now() / 1000) + (CONFIG.TOKEN_EXPIRY_HOURS * 3600);
  payload.iat = Math.floor(Date.now() / 1000);

  const base64EncodeUrl = (str) => {
    return Utilities.base64EncodeWebSafe(str).replace(/=+$/, "");
  };

  const stringifiedHeader = JSON.stringify(header);
  const encodedHeader = base64EncodeUrl(stringifiedHeader);

  const stringifiedPayload = JSON.stringify(payload);
  const encodedPayload = base64EncodeUrl(stringifiedPayload);

  const signatureInput = encodedHeader + "." + encodedPayload;
  const signature = Utilities.computeHmacSha256Signature(signatureInput, CONFIG.JWT_SECRET);
  const encodedSignature = base64EncodeUrl(signature);

  return encodedHeader + "." + encodedPayload + "." + encodedSignature;
}

/**
 * Verify JWT Token Signature & Claims
 */
function verifyRequestToken(token) {
  if (!token || token.split(".").length !== 3) return null;

  try {
    const parts = token.split(".");
    const header = parts[0];
    const payload = parts[1];
    const signature = parts[2];

    const base64EncodeUrl = (str) => {
      return Utilities.base64EncodeWebSafe(str).replace(/=+$/, "");
    };

    const reSignatureInput = header + "." + payload;
    const expectedSignature = base64EncodeUrl(Utilities.computeHmacSha256Signature(reSignatureInput, CONFIG.JWT_SECRET));

    if (signature !== expectedSignature) {
      return null; // Invalid signature
    }

    const decodedPayload = JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(payload)).getDataAsString());
    
    // Check Expiry
    const now = Math.floor(Date.now() / 1000);
    if (decodedPayload.exp && decodedPayload.exp < now) {
      return null; // Token expired
    }

    return decodedPayload;
  } catch (err) {
    Logger.log("JWT Verification Error: " + err.toString());
    return null;
  }
}

/**
 * Handle Standard Customer Registration
 */
function handleRegister(payload) {
  const { phone, email, password, fullName, gender, dob, address, city, pincode } = payload;

  if (!phone || !password || !fullName) {
    return { status: "error", message: "Phone, password, and full name are required." };
  }

  const ss = getDbSpreadsheet();
  const usersSheet = ss.getSheetByName("Users");
  const customersSheet = ss.getSheetByName("Customers");

  // Check if Phone already registered
  const userRows = usersSheet.getDataRange().getValues();
  for (let i = 1; i < userRows.length; i++) {
    if (userRows[i][1].toString() === phone.toString()) {
      return { status: "error", message: "Phone number already registered. Please login." };
    }
  }

  const userId = "USR_" + Utilities.getUuid().substring(0, 8).toUpperCase();
  const customerId = "CUST_" + Utilities.getUuid().substring(0, 8).toUpperCase();
  const hashedPassword = hashPassword(password);
  const now = new Date().toISOString();

  // Append User record
  usersSheet.appendRow([
    userId,
    phone,
    email || "",
    hashedPassword,
    "Customer",
    "Active",
    now,
    now,
    payload.pushToken || ""
  ]);

  // Append Customer Details
  customersSheet.appendRow([
    customerId,
    userId,
    fullName,
    gender || "Unspecified",
    dob || "",
    payload.bloodGroup || "",
    address || "",
    city || "Chennai",
    pincode || "",
    ""
  ]);

  const token = generateJWT({ userId: userId, role: "Customer", phone: phone });

  return {
    status: "success",
    message: "Registration successful!",
    authToken: token,
    user: {
      userId: userId,
      customerId: customerId,
      fullName: fullName,
      phone: phone,
      email: email,
      role: "Customer"
    }
  };
}

/**
 * Handle Login (Phone/Email + Password)
 */
function handleLogin(payload) {
  const { loginIdentifier, password } = payload;

  if (!loginIdentifier || !password) {
    return { status: "error", message: "Identifier and password required" };
  }

  const ss = getDbSpreadsheet();
  const usersSheet = ss.getSheetByName("Users");
  const userRows = usersSheet.getDataRange().getValues();
  const hashedPassword = hashPassword(password);

  let foundUser = null;
  for (let i = 1; i < userRows.length; i++) {
    const row = userRows[i];
    // Check against Phone (col 1) or Email (col 2)
    if ((row[1].toString() === loginIdentifier.toString() || row[2].toString().toLowerCase() === loginIdentifier.toLowerCase()) && row[3] === hashedPassword) {
      if (row[5] !== "Active") {
        return { status: "error", message: "Account is inactive. Contact support." };
      }
      foundUser = {
        userId: row[0],
        phone: row[1],
        email: row[2],
        role: row[4],
        rowIndex: i + 1
      };
      break;
    }
  }

  if (!foundUser) {
    return { status: "error", message: "Invalid credentials. Please check phone/password." };
  }

  // Update last login timestamp
  usersSheet.getRange(foundUser.rowIndex, 8).setValue(new Date().toISOString());

  const token = generateJWT({ userId: foundUser.userId, role: foundUser.role, phone: foundUser.phone });

  // Get Profile details
  const profile = getUserProfile(foundUser.userId);

  return {
    status: "success",
    message: "Login successful!",
    authToken: token,
    user: profile.data
  };
}

/**
 * Get User Profile Details
 */
function getUserProfile(userId) {
  const ss = getDbSpreadsheet();
  const usersSheet = ss.getSheetByName("Users");
  const customersSheet = ss.getSheetByName("Customers");

  const userRows = usersSheet.getDataRange().getValues();
  let userRecord = null;
  for (let i = 1; i < userRows.length; i++) {
    if (userRows[i][0] === userId) {
      userRecord = userRows[i];
      break;
    }
  }

  if (!userRecord) {
    return { status: "error", message: "User not found" };
  }

  const customerRows = customersSheet.getDataRange().getValues();
  let customerRecord = null;
  for (let j = 1; j < customerRows.length; j++) {
    if (customerRows[j][1] === userId) {
      customerRecord = customerRows[j];
      break;
    }
  }

  return {
    status: "success",
    data: {
      userId: userRecord[0],
      phone: userRecord[1],
      email: userRecord[2],
      role: userRecord[4],
      status: userRecord[5],
      fullName: customerRecord ? customerRecord[2] : "User",
      gender: customerRecord ? customerRecord[3] : "",
      dob: customerRecord ? customerRecord[4] : "",
      bloodGroup: customerRecord ? customerRecord[5] : "",
      address: customerRecord ? customerRecord[6] : "",
      city: customerRecord ? customerRecord[7] : "",
      pincode: customerRecord ? customerRecord[8] : "",
      profilePhoto: customerRecord ? customerRecord[9] : ""
    }
  };
}

/**
 * Update Customer Profile
 */
function updateUserProfile(userId, payload) {
  const ss = getDbSpreadsheet();
  const customersSheet = ss.getSheetByName("Customers");
  const rows = customersSheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] === userId) {
      const rowIndex = i + 1;
      if (payload.fullName !== undefined) customersSheet.getRange(rowIndex, 3).setValue(payload.fullName);
      if (payload.gender !== undefined) customersSheet.getRange(rowIndex, 4).setValue(payload.gender);
      if (payload.dob !== undefined) customersSheet.getRange(rowIndex, 5).setValue(payload.dob);
      if (payload.bloodGroup !== undefined) customersSheet.getRange(rowIndex, 6).setValue(payload.bloodGroup);
      if (payload.address !== undefined) customersSheet.getRange(rowIndex, 7).setValue(payload.address);
      if (payload.city !== undefined) customersSheet.getRange(rowIndex, 8).setValue(payload.city);
      if (payload.pincode !== undefined) customersSheet.getRange(rowIndex, 9).setValue(payload.pincode);
      if (payload.profilePhoto !== undefined) customersSheet.getRange(rowIndex, 10).setValue(payload.profilePhoto);

      return { status: "success", message: "Profile updated successfully!" };
    }
  }

  return { status: "error", message: "Customer profile record not found." };
}

/**
 * Stub for Google Login & OTP Verification Handlers
 */
function handleGoogleLogin(payload) {
  return { status: "success", message: "Google Auth stub ready", payload: payload };
}

function handleVerifyOTP(payload) {
  return { status: "success", message: "OTP Auth stub ready", payload: payload };
}
