/**
 * Selfcare Diagnostics - Client Authentication Engine
 * Password Auth, OTP, Google Login & Session Management
 */

const Auth = {
  // Temporary storage during OTP workflow
  otpSession: {
    phone: "",
    otpCode: ""
  },

  /**
   * Handle Standard Login
   */
  async login(loginIdentifier, password) {
    if (!loginIdentifier || !password) {
      AppCore.showToast("Please enter phone/email and password", "warning");
      return;
    }

    AppCore.showToast("Authenticating...", "info");

    const res = await API.post("auth_login", {
      loginIdentifier: loginIdentifier,
      password: password
    });

    if (res.status === "success") {
      Store.setAuth(res.authToken, res.user);
      AppCore.showToast("Welcome back, " + (res.user.fullName || "User") + "!", "success");
      Router.navigate("home");
    } else {
      AppCore.showToast(res.message || "Login failed", "error");
    }
  },

  /**
   * Handle Registration
   */
  async register(formData) {
    if (!formData.phone || !formData.password || !formData.fullName) {
      AppCore.showToast("Please fill in all required fields", "warning");
      return;
    }

    if (formData.password.length < 6) {
      AppCore.showToast("Password must be at least 6 characters", "warning");
      return;
    }

    AppCore.showToast("Creating account...", "info");

    const res = await API.post("auth_register", formData);

    if (res.status === "success") {
      Store.setAuth(res.authToken, res.user);
      AppCore.showToast("Registration successful!", "success");
      Router.navigate("home");
    } else {
      AppCore.showToast(res.message || "Registration failed", "error");
    }
  },

  /**
   * Request OTP for Phone Authentication
   */
  async requestOTP(phone) {
    if (!phone || phone.length < 10) {
      AppCore.showToast("Please enter a valid 10-digit mobile number", "warning");
      return false;
    }

    // Generate 6-digit OTP for SMS/WhatsApp verification
    const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    this.otpSession = { phone: phone, otpCode: generatedOTP };

    AppCore.showToast(`OTP sent to +91 ${phone} (Demo OTP: ${generatedOTP})`, "success");
    Router.navigate("otp");
    return true;
  },

  /**
   * Verify Entered OTP
   */
  async verifyOTP(enteredOTP) {
    if (!enteredOTP || enteredOTP.length !== 6) {
      AppCore.showToast("Enter a valid 6-digit OTP", "warning");
      return;
    }

    if (enteredOTP === this.otpSession.otpCode) {
      AppCore.showToast("OTP Verified successfully!", "success");
      
      // Auto-register / Auto-login guest or user with phone number
      const mockUser = {
        userId: "USR_" + Math.random().toString(36).substr(2, 6).toUpperCase(),
        phone: "+91" + this.otpSession.phone,
        fullName: "Patient (" + this.otpSession.phone.slice(-4) + ")",
        role: APP_CONFIG.ROLES.CUSTOMER
      };

      const mockToken = "JWT_OTP_VERIFIED_" + Date.now();
      Store.setAuth(mockToken, mockUser);
      Router.navigate("home");
    } else {
      AppCore.showToast("Invalid OTP code. Please try again.", "error");
    }
  },

  /**
   * Guest Access Authentication
   */
  guestLogin() {
    const guestUser = {
      userId: "GUEST_" + Date.now().toString().slice(-6),
      fullName: "Guest User",
      role: APP_CONFIG.ROLES.GUEST,
      phone: ""
    };
    
    // Store empty token for guest state
    Store.setAuth("GUEST_TOKEN", guestUser);
    AppCore.showToast("Browsing as Guest", "info");
    Router.navigate("home");
  },

  /**
   * Google One-Tap / OAuth Sign-In
   */
  googleSignIn() {
    AppCore.showToast("Initializing Google Sign-In...", "info");
    // Simulated Google OAuth Flow
    setTimeout(() => {
      const googleUser = {
        userId: "USR_GGL_" + Date.now().toString().slice(-6),
        email: "user.google@gmail.com",
        fullName: "Google Health User",
        role: APP_CONFIG.ROLES.CUSTOMER
      };
      Store.setAuth("JWT_GOOGLE_TOKEN_" + Date.now(), googleUser);
      AppCore.showToast("Signed in with Google!", "success");
      Router.navigate("home");
    }, 1000);
  },

  /**
   * User Logout
   */
  logout() {
    Store.clearAuth();
    AppCore.showToast("Logged out successfully", "info");
    Router.navigate("login");
  }
};

window.Auth = Auth;
