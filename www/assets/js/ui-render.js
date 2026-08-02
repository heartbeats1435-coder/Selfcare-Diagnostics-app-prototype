/**
 * Selfcare Diagnostics - Main Screen UI Renderer
 * Generates Views for Home, Auth, Tests, Cart, Reports & Profile
 */

const UIRender = {
  /**
   * Render Login Screen
   */
  renderLogin() {
    return `
      <div style="padding: 24px 16px;">
        <div style="text-align: center; margin-bottom: 32px; margin-top: 20px;">
          <div style="width: 64px; height: 64px; border-radius: 16px; background: linear-gradient(135deg, var(--md-sys-color-primary), var(--md-sys-color-secondary)); display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 28px; font-weight: bold; margin-bottom: 12px; box-shadow: var(--md-elevation-2);">S</div>
          <h2 style="font-size: 24px; font-weight: 700; color: var(--md-sys-color-on-background);">Welcome Back</h2>
          <p style="font-size: 14px; color: var(--md-sys-color-on-surface-variant); margin-top: 4px;">Sign in to manage test bookings & reports</p>
        </div>

        <div class="card-glass" style="margin-bottom: 20px;">
          <form onsubmit="event.preventDefault(); Auth.login(document.getElementById('login-id').value, document.getElementById('login-pass').value);">
            <div class="form-group">
              <label class="form-label">Phone or Email</label>
              <input type="text" id="login-id" class="form-input" placeholder="+91 9876543210 or user@email.com" required>
            </div>

            <div class="form-group" style="margin-bottom: 24px;">
              <label class="form-label">Password</label>
              <input type="password" id="login-pass" class="form-input" placeholder="••••••••" required>
            </div>

            <button type="submit" class="btn btn-primary">Sign In</button>
          </form>
        </div>

        <div style="text-align: center; margin: 16px 0; color: var(--md-sys-color-on-surface-variant); font-size: 12px; font-weight: 600;">OR SIGN IN WITH</div>

        <div style="display: flex; gap: 12px; margin-bottom: 24px;">
          <button class="btn btn-outline" style="flex: 1;" onclick="Auth.googleSignIn()">
            <svg viewBox="0 0 24 24" width="18" height="18"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
            Google
          </button>

          <button class="btn btn-secondary" style="flex: 1;" onclick="const phone = prompt('Enter your 10-digit mobile number:'); if(phone) Auth.requestOTP(phone);">
            📲 OTP Login
          </button>
        </div>

        <div style="text-align: center; font-size: 14px;">
          <span style="color: var(--md-sys-color-on-surface-variant);">Don't have an account? </span>
          <a href="#register" style="color: var(--md-sys-color-primary); font-weight: 700; text-decoration: none;">Register Now</a>
        </div>

        <div style="text-align: center; margin-top: 16px;">
          <button class="btn-icon" style="width: auto; height: auto; padding: 8px 16px; font-size: 13px; color: var(--md-sys-color-on-surface-variant);" onclick="Auth.guestLogin()">
            Continue as Guest →
          </button>
        </div>
      </div>
    `;
  },

  /**
   * Render Registration Screen
   */
  renderRegister() {
    return `
      <div style="padding: 24px 16px;">
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 24px; font-weight: 700;">Create Account</h2>
          <p style="font-size: 14px; color: var(--md-sys-color-on-surface-variant);">Register for personalized health tracking</p>
        </div>

        <div class="card-glass">
          <form onsubmit="event.preventDefault(); Auth.register({
            fullName: document.getElementById('reg-name').value,
            phone: document.getElementById('reg-phone').value,
            email: document.getElementById('reg-email').value,
            password: document.getElementById('reg-pass').value,
            gender: document.getElementById('reg-gender').value,
            pincode: document.getElementById('reg-pincode').value
          });">
            <div class="form-group">
              <label class="form-label">Full Name *</label>
              <input type="text" id="reg-name" class="form-input" placeholder="e.g. Ramesh Kumar" required>
            </div>

            <div class="form-group">
              <label class="form-label">Phone Number *</label>
              <input type="tel" id="reg-phone" class="form-input" placeholder="10-digit mobile number" required pattern="[0-9]{10}">
            </div>

            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input type="email" id="reg-email" class="form-input" placeholder="name@example.com">
            </div>

            <div class="form-group">
              <label class="form-label">Password *</label>
              <input type="password" id="reg-pass" class="form-input" placeholder="At least 6 characters" required>
            </div>

            <div style="display: flex; gap: 12px;">
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Gender</label>
                <select id="reg-gender" class="form-input">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div class="form-group" style="flex: 1;">
                <label class="form-label">Pincode</label>
                <input type="text" id="reg-pincode" class="form-input" placeholder="600040">
              </div>
            </div>

            <button type="submit" class="btn btn-primary" style="margin-top: 12px;">Complete Registration</button>
          </form>
        </div>

        <div style="text-align: center; font-size: 14px; margin-top: 20px;">
          <span style="color: var(--md-sys-color-on-surface-variant);">Already have an account? </span>
          <a href="#login" style="color: var(--md-sys-color-primary); font-weight: 700; text-decoration: none;">Login</a>
        </div>
      </div>
    `;
  },

  /**
   * Render OTP Verification Screen
   */
  renderOTP() {
    return `
      <div style="padding: 32px 16px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 12px;">📲</div>
        <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 8px;">Verify Phone Number</h2>
        <p style="font-size: 14px; color: var(--md-sys-color-on-surface-variant); margin-bottom: 24px;">
          Enter the 6-digit verification code sent to <br><strong>+91 ${Auth.otpSession.phone || "Mobile"}</strong>
        </p>

        <div class="card-glass" style="max-width: 320px; margin: 0 auto 24px;">
          <input type="text" id="otp-input" class="form-input" style="text-align: center; font-size: 24px; letter-spacing: 8px; font-weight: bold;" maxlength="6" placeholder="000000" autofocus>
          
          <button class="btn btn-primary" style="margin-top: 16px;" onclick="Auth.verifyOTP(document.getElementById('otp-input').value)">
            Verify & Proceed
          </button>
        </div>

        <p style="font-size: 13px; color: var(--md-sys-color-on-surface-variant);">
          Didn't receive code? <a href="javascript:void(0)" onclick="Auth.requestOTP(Auth.otpSession.phone)" style="color: var(--md-sys-color-primary); font-weight: 600;">Resend OTP</a>
        </p>
      </div>
    `;
  },

  /**
   * Placeholder Renderers for Core Navigation Tabs (Expanded in Steps 8-15)
   */
    /**
   * Integrated Customer Home Screen
   */
  renderHome() {
    // Automatically trigger catalog fetch if empty
    if (HomeView.testsList.length === 0 && !HomeView.isLoading) {
      setTimeout(() => HomeView.loadCatalog(), 50);
    }
    return HomeView.render();
  },

      <div style="padding: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            <span style="font-size: 12px; color: var(--md-sys-color-on-surface-variant); text-transform: uppercase; font-weight: 600;">Location</span>
            <div style="font-size: 15px; font-weight: 700; display: flex; align-items: center; gap: 4px;">
              📍 ${Store.state.selectedLocation.city}
            </div>
          </div>
          <div class="chip chip-primary">👋 Hello, ${user.fullName.split(" ")[0]}</div>
        </div>

        <!-- Banner Container -->
        <div class="card-glass" style="background: linear-gradient(135deg, var(--md-sys-color-primary), var(--md-sys-color-tertiary)); color: white; padding: 20px; margin-bottom: 20px;">
          <span style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase;">Selfcare Diagnostics</span>
          <h3 style="font-size: 20px; margin-top: 8px; font-weight: 800;">Full Body Health Checkup</h3>
          <p style="font-size: 13px; opacity: 0.9; margin-top: 4px;">Includes 80+ Blood Parameters with Free Home Sample Collection</p>
          <button class="btn" style="background: white; color: var(--md-sys-color-primary); width: auto; margin-top: 14px; padding: 8px 16px;" onclick="Router.navigate('tests')">
            Book @ ₹999 Only
          </button>
        </div>

        <p style="font-size: 14px; color: var(--md-sys-color-on-surface-variant); text-align: center; margin-top: 24px;">
          Loading diagnostic catalog...
        </p>
      </div>
    `;
  },

  renderTests() { return `<div style="padding: 16px;"><h2>Diagnostic Tests & Packages</h2><p>Step 8 & 10 view placeholder...</p></div>`; },
  /**
 * Integrated Shopping Cart & Slot View
 */
renderCart() {
  return CartView.render();
},
renderTracking() {
  return TrackingView.renderTracking();
},
  /**
 * Integrated Diagnostic Reports Screen
 */
renderReports() {
  return ReportsView.render();
},
/**
 * Integrated Technician Portal
 */
renderTechnician() {
  return TechnicianView.render();
},  
/*** Render Interactive AI Health Hub & Chat View
   */
  renderAIAssistant() {
    return `
      <div style="padding: 16px;">
        <!-- Header -->
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #6366f1, #0284c7); display: flex; align-items: center; justify-content: center; color: white; font-size: 22px;">✨</div>
          <div>
            <h3 style="font-size: 18px; font-weight: 800;">Selfcare AI Health Assistant</h3>
            <p style="font-size: 12px; color: var(--md-sys-color-on-surface-variant);">Symptom checker, Prescription Reader & Smart Guidance</p>
          </div>
        </div>

        <!-- AI Feature Tabs -->
        <div class="card-glass" style="margin-bottom: 20px; padding: 16px;">
          <h4 style="font-size: 14px; font-weight: 700; margin-bottom: 10px;">🩺 AI Symptom Test Recommender</h4>
          <div class="form-group">
            <textarea id="ai-symptom-input" class="form-input" rows="3" placeholder="Describe how you feel (e.g., Feeling extremely tired, frequent headaches, joint pain...)"></textarea>
          </div>
          <button class="btn btn-primary" style="font-size: 13px;" onclick="
            const val = document.getElementById('ai-symptom-input').value;
            document.getElementById('ai-symptom-results').innerHTML = '<p style=\'font-size:13px; color:var(--md-sys-color-primary);\'>Analyzing symptoms with Gemini AI...</p>';
            AIEngine.recommendTestsFromSymptoms(val).then(res => {
              if(res.status === 'success') {
                let html = '<div style=\'margin-top:12px; font-size:13px;\'><strong>Recommended Investigations:</strong><ul style=\'margin-left:16px; margin-top:6px;\'>';
                res.data.recommendations.forEach(r => {
                  html += `<li style=\'margin-bottom:6px;\'><strong>${r.testName}</strong> - ${r.reason} <span class=\'chip chip-primary\' style=\'font-size:10px;\'>${r.urgency}</span></li>`;
                });
                html += '</ul></div>';
                document.getElementById('ai-symptom-results').innerHTML = html;
              }
            });
          ">
            ✨ Recommend Tests
          </button>
          <div id="ai-symptom-results"></div>
        </div>

        <!-- AI Prescription Upload -->
        <div class="card-glass" style="margin-bottom: 20px; padding: 16px;">
          <h4 style="font-size: 14px; font-weight: 700; margin-bottom: 8px;">📄 AI Prescription Reader</h4>
          <p style="font-size: 12px; color: var(--md-sys-color-on-surface-variant); margin-bottom: 12px;">Upload prescription photo to extract tests automatically</p>
          
          <input type="file" id="prescription-file" accept="image/*" style="display:none;" onchange="
            const file = this.files[0];
            if(file) {
              const reader = new FileReader();
              reader.onload = function(e) {
                document.getElementById('ai-ocr-results').innerHTML = '<p style=\'font-size:13px; color:var(--md-sys-color-primary);\'>Reading prescription with Gemini Multimodal Vision...</p>';
                AIEngine.readPrescriptionImage(e.target.result).then(res => {
                  if(res.status === 'success') {
                    let h = '<div style=\'margin-top:10px; font-size:13px; color:var(--md-sys-color-success);\'><strong>Detected Investigations:</strong><ul>';
                    res.data.extractedTests.forEach(t => h += `<li>✓ ${t}</li>`);
                    h += `</ul><p style=\'font-size:11px; margin-top:4px;\'>${res.data.doctorNotes}</p></div>`;
                    document.getElementById('ai-ocr-results').innerHTML = h;
                  }
                });
              };
              reader.readAsDataURL(file);
            }
          ">
          
          <button class="btn btn-secondary" onclick="document.getElementById('prescription-file').click()">
            📷 Upload Prescription Photo
          </button>
          <div id="ai-ocr-results"></div>
        </div>

        <!-- Conversational Chat Window -->
        <div class="card-glass" style="padding: 16px;">
          <h4 style="font-size: 14px; font-weight: 700; margin-bottom: 12px;">💬 Chat with Selfcare AI</h4>
          <div id="chat-messages" style="max-height: 200px; overflow-y: auto; margin-bottom: 12px; display: flex; flex-direction: column; gap: 8px; font-size: 13px;">
            <div style="background: var(--md-sys-color-surface-variant); padding: 8px 12px; border-radius: 8px; align-self: flex-start;">
              Hello! I am your AI health assistant. Ask me anything about blood tests or health packages.
            </div>
          </div>
          <div style="display: flex; gap: 8px;">
            <input type="text" id="chat-input" class="form-input" placeholder="Ask a health question..." style="font-size: 13px;">
            <button class="btn btn-primary" style="width: auto; padding: 0 16px;" onclick="
              const msg = document.getElementById('chat-input').value;
              if(!msg) return;
              const box = document.getElementById('chat-messages');
              box.innerHTML += `<div style=\'background:var(--md-sys-color-primary-container); color:var(--md-sys-color-on-primary-container); padding:8px 12px; border-radius:8px; align-self:flex-end;\'>${msg}</div>`;
              document.getElementById('chat-input').value = '';
              AIEngine.chatAssistant(msg).then(reply => {
                box.innerHTML += `<div style=\'background:var(--md-sys-color-surface-variant); padding:8px 12px; border-radius:8px; align-self:flex-start;\'>${reply}</div>`;
                box.scrollTop = box.scrollHeight;
              });
            ">Send</button>
          </div>
        </div>
      </div>
    `;
  },
  renderProfile() { 
    const user = Store.state.user || { fullName: "Guest User", role: "Guest" };
    return `
      <div style="padding: 16px;">
        <div class="card-glass" style="text-align: center; margin-bottom: 16px;">
          <div style="width: 72px; height: 72px; border-radius: 50%; background: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container); font-size: 28px; font-weight: bold; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px;">
            ${user.fullName.charAt(0)}
          </div>
          <h3 style="font-size: 18px; font-weight: 700;">${user.fullName}</h3>
          <span class="chip chip-primary" style="margin-top: 6px;">${user.role}</span>
        </div>

        ${Store.isAuthenticated() ? `
          <button class="btn btn-outline" style="color: var(--md-sys-color-error); border-color: var(--md-sys-color-error);" onclick="Auth.logout()">
            Sign Out
          </button>
        ` : `
          <button class="btn btn-primary" onclick="Router.navigate('login')">
            Sign In / Register
          </button>
        `}
      </div>
    `;
  }
};

// Register Routes with Router Engine
Router.addRoute("home", UIRender.renderHome);
Router.addRoute("login", UIRender.renderLogin);
Router.addRoute("register", UIRender.renderRegister);
Router.addRoute("otp", UIRender.renderOTP);
Router.addRoute("tests", UIRender.renderTests);
Router.addRoute("cart", UIRender.renderCart);
Router.addRoute("reports", UIRender.renderReports, true); // Protected
Router.addRoute("profile", UIRender.renderProfile);
Router.addRoute("payment", UIRender.renderPayment);
Router.addRoute("confirmation", UIRender.renderConfirmation);

// Kickstart Router
window.addEventListener("load", () => Router.init());

window.UIRender = UIRender;
