/**
 * Selfcare Diagnostics - Client Payment Controller
 * Supports Razorpay SDK, UPI Intent & Cash on Collection
 */

const PaymentView = {
  selectedMethod: "UPI",
  isProcessing: false,
  lastConfirmedBooking: null,

  /**
   * Load Razorpay Checkout JS SDK dynamically
   */
  loadRazorpaySDK() {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  },

  /**
   * Process Checkout Payment
   */
  async processPayment() {
    const summary = CartView.getBillingSummary();
    const cartItems = Store.state.cart;

    if (cartItems.length === 0) {
      AppCore.showToast("Your cart is empty!", "warning");
      Router.navigate("cart");
      return;
    }

    this.isProcessing = true;
    AppCore.showToast("Initiating order placement...", "info");

    const bookingPayload = {
      items: cartItems,
      billing: summary,
      slot: CartView.selectedSlot,
      date: CartView.selectedDate,
      address: CartView.selectedAddress,
      paymentMode: this.selectedMethod,
      paymentId: "PAY_" + Date.now()
    };

    // Flow 1: Online Payment via Razorpay SDK (Cards / UPI / NetBanking)
    if (this.selectedMethod === "CARD" || this.selectedMethod === "RAZORPAY") {
      const sdkLoaded = await this.loadRazorpaySDK();
      if (!sdkLoaded) {
        AppCore.showToast("Failed to load Razorpay Payment Gateway. Trying offline option.", "error");
        this.isProcessing = false;
        return;
      }

      const options = {
        key: APP_CONFIG.RAZORPAY_KEY_ID,
        amount: summary.finalAmount * 100, // Amount in paise
        currency: APP_CONFIG.CURRENCY,
        name: APP_CONFIG.APP_NAME,
        description: "Diagnostic Blood Collection Booking",
        prefill: {
          name: Store.state.user ? Store.state.user.fullName : "Guest Patient",
          contact: Store.state.user ? Store.state.user.phone : ""
        },
        theme: { color: "#0284C7" },
        handler: async (response) => {
          bookingPayload.paymentId = response.razorpay_payment_id;
          await PaymentView.finalizeBookingOnServer(bookingPayload);
        },
        modal: {
          ondismiss: () => {
            PaymentView.isProcessing = false;
            AppCore.showToast("Payment window closed", "info");
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      return;
    }

    // Flow 2: Direct UPI App Launch (GPay, PhonePe, Paytm)
    if (this.selectedMethod === "UPI") {
      const upiUri = `upi://pay?pa=selfcare@upi&pn=SelfcareDiagnostics&am=${summary.finalAmount}&cu=INR&tn=DiagnosticBooking`;
      window.location.href = upiUri;

      // Finalize booking payload after UPI prompt launch
      setTimeout(async () => {
        await PaymentView.finalizeBookingOnServer(bookingPayload);
      }, 2000);
      return;
    }

    // Flow 3: Cash on Sample Collection
    if (this.selectedMethod === "CASH") {
      await this.finalizeBookingOnServer(bookingPayload);
    }
  },

  /**
   * Submit Final Booking to Apps Script Backend
   */
  async finalizeBookingOnServer(bookingPayload) {
    const res = await API.post("create_booking", bookingPayload);

    this.isProcessing = false;

    if (res && res.status === "success") {
      this.lastConfirmedBooking = res;
      Store.clearCart(); // Clear local shopping cart
      AppCore.showToast("Booking Confirmed Successfully! 🎉", "success");
      Router.navigate("confirmation");
    } else {
      AppCore.showToast(res.message || "Failed to confirm booking. Please try again.", "error");
    }
  },

  /**
   * Select Payment Option
   */
  setMethod(method) {
    this.selectedMethod = method;
    this.refreshView();
  },

  refreshView() {
    const container = document.getElementById("main-content");
    if (container && Store.state.currentRoute === "payment") {
      container.innerHTML = this.renderPayment();
    }
  },

  /**
   * Render Payment Screen
   */
  renderPayment() {
    const summary = CartView.getBillingSummary();

    return `
      <div style="padding: 16px;">
        <h3 style="font-size: 20px; font-weight: 800; margin-bottom: 16px;">Select Payment Method</h3>

        <div class="card-glass" style="margin-bottom: 20px; padding: 16px;">
          <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 6px;">
            <span>Amount Payable</span>
            <span style="font-size: 18px; font-weight: 800; color: var(--md-sys-color-primary);">₹${summary.finalAmount}</span>
          </div>
          <p style="font-size: 12px; color: var(--md-sys-color-on-surface-variant);">Includes home sample collection & digital AI report delivery</p>
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px;">
          <div 
            onclick="PaymentView.setMethod('UPI')"
            class="card-glass" 
            style="padding: 16px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; border: 2px solid ${this.selectedMethod === "UPI" ? "var(--md-sys-color-primary)" : "transparent"};">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 24px;">⚡</span>
              <div>
                <h5 style="font-size: 14px; font-weight: 700;">UPI / Instant Pay</h5>
                <p style="font-size: 11px; color: var(--md-sys-color-on-surface-variant);">GPay, PhonePe, Paytm or Cred</p>
              </div>
            </div>
            <input type="radio" name="pay-method" ${this.selectedMethod === "UPI" ? "checked" : ""}>
          </div>

          <div 
            onclick="PaymentView.setMethod('CARD')"
            class="card-glass" 
            style="padding: 16px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; border: 2px solid ${this.selectedMethod === "CARD" ? "var(--md-sys-color-primary)" : "transparent"};">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 24px;">💳</span>
              <div>
                <h5 style="font-size: 14px; font-weight: 700;">Debit / Credit Card / NetBanking</h5>
                <p style="font-size: 11px; color: var(--md-sys-color-on-surface-variant);">Razorpay Secure Gateway</p>
              </div>
            </div>
            <input type="radio" name="pay-method" ${this.selectedMethod === "CARD" ? "checked" : ""}>
          </div>

          <div 
            onclick="PaymentView.setMethod('CASH')"
            class="card-glass" 
            style="padding: 16px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; border: 2px solid ${this.selectedMethod === "CASH" ? "var(--md-sys-color-primary)" : "transparent"};">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 24px;">💵</span>
              <div>
                <h5 style="font-size: 14px; font-weight: 700;">Cash on Sample Collection</h5>
                <p style="font-size: 11px; color: var(--md-sys-color-on-surface-variant);">Pay directly to technician during collection</p>
              </div>
            </div>
            <input type="radio" name="pay-method" ${this.selectedMethod === "CASH" ? "checked" : ""}>
          </div>
        </div>

        <button 
          class="btn btn-primary" 
          style="height: 52px; font-size: 16px;" 
          ${this.isProcessing ? "disabled" : ""}
          onclick="PaymentView.processPayment()">
          ${this.isProcessing ? "Processing Booking..." : `Pay ₹${summary.finalAmount} & Place Booking`}
        </button>
      </div>
    `;
  },

  /**
   * Render Booking Confirmation Screen
   */
  renderConfirmation() {
    const booking = this.lastConfirmedBooking || {
      bookingId: "BK_DEMO88",
      finalAmount: 999,
      date: new Date().toISOString().split("T")[0],
      slot: "07:00 AM - 08:00 AM"
    };

    return `
      <div style="padding: 32px 16px; text-align: center;">
        <div style="width: 72px; height: 72px; border-radius: 50%; background: var(--md-sys-color-success-container); color: var(--md-sys-color-success); font-size: 36px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
          ✓
        </div>
        <h2 style="font-size: 22px; font-weight: 800; margin-bottom: 6px;">Booking Confirmed!</h2>
        <p style="font-size: 13px; color: var(--md-sys-color-on-surface-variant); margin-bottom: 24px;">
          Your home sample collection is scheduled successfully.
        </p>

        <div class="card-glass" style="text-align: left; padding: 16px; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px;">
            <span style="color: var(--md-sys-color-on-surface-variant);">Booking ID</span>
            <strong style="color: var(--md-sys-color-primary);">${booking.bookingId}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px;">
            <span style="color: var(--md-sys-color-on-surface-variant);">Scheduled Date</span>
            <strong>${booking.date}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px;">
            <span style="color: var(--md-sys-color-on-surface-variant);">Time Slot</span>
            <strong>${booking.slot}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px;">
            <span style="color: var(--md-sys-color-on-surface-variant);">Amount Paid</span>
            <strong>₹${booking.finalAmount}</strong>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          <button class="btn btn-primary" onclick="Router.navigate('home')">
            Back to Home
          </button>
          <button class="btn btn-outline" onclick="AppCore.showToast('Technician dispatch notification sent!', 'info')">
            📍 Track Technician Arrival
          </button>
        </div>
      </div>
    `;
  }
};

window.PaymentView = PaymentView;
