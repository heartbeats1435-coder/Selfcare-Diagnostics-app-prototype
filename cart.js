/**
 * Selfcare Diagnostics - Shopping Cart & Slot Booking Engine
 * Handles Item Management, Slot Picker, Family Selection & Order Breakdown
 */

const CartView = {
  appliedCoupon: null,
  availableCoupons: [
    { code: "WELCOME50", discount: 50, minOrder: 300, type: "FLAT" },
    { code: "HEALTH20", discount: 20, minOrder: 500, type: "PERCENT" }
  ],
  selectedPatient: "Self",
  selectedAddress: "Home - 123 Health Avenue, Anna Nagar, Chennai",
  selectedDate: new Date().toISOString().split("T")[0],
  selectedSlot: "07:00 AM - 08:00 AM",

  timeSlots: [
    "06:00 AM - 07:00 AM",
    "07:00 AM - 08:00 AM",
    "08:00 AM - 09:00 AM",
    "09:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM",
    "04:00 PM - 05:00 PM",
    "05:00 PM - 06:00 PM"
  ],

  /**
   * Remove item from cart
   */
  removeItem(itemId, itemType) {
    Store.removeFromCart(itemId, itemType);
    AppCore.showToast("Item removed from cart", "info");
    this.refreshView();
  },

  /**
   * Apply Coupon Code
   */
  applyCoupon(code) {
    const coupon = this.availableCoupons.find((c) => c.code === code.toUpperCase().trim());
    const subtotal = Store.getCartTotal();

    if (!coupon) {
      AppCore.showToast("Invalid coupon code", "error");
      return;
    }

    if (subtotal < coupon.minOrder) {
      AppCore.showToast(`Minimum order value for ${coupon.code} is ₹${coupon.minOrder}`, "warning");
      return;
    }

    this.appliedCoupon = coupon;
    AppCore.showToast(`Coupon ${coupon.code} applied successfully!`, "success");
    this.refreshView();
  },

  /**
   * Remove Coupon Code
   */
  removeCoupon() {
    this.appliedCoupon = null;
    AppCore.showToast("Coupon removed", "info");
    this.refreshView();
  },

  /**
   * Calculate Financial Totals
   */
  getBillingSummary() {
    const subtotal = Store.getCartTotal();
    const homeCollectionFee = subtotal >= 500 || subtotal === 0 ? 0 : 100;
    let discountAmount = 0;

    if (this.appliedCoupon) {
      if (this.appliedCoupon.type === "FLAT") {
        discountAmount = this.appliedCoupon.discount;
      } else if (this.appliedCoupon.type === "PERCENT") {
        discountAmount = Math.round((subtotal * this.appliedCoupon.discount) / 100);
      }
    }

    const finalAmount = Math.max(0, subtotal + homeCollectionFee - discountAmount);

    return {
      subtotal,
      homeCollectionFee,
      discountAmount,
      finalAmount
    };
  },

  /**
   * Set Collection Slot
   */
  setSlot(slot) {
    this.selectedSlot = slot;
    this.refreshView();
  },

  /**
   * Refresh View Component
   */
  refreshView() {
    const container = document.getElementById("main-content");
    if (container && Store.state.currentRoute === "cart") {
      container.innerHTML = this.render();
    }
  },

  /**
   * Render Shopping Cart & Booking View
   */
  render() {
    const cartItems = Store.state.cart;
    const summary = this.getBillingSummary();

    if (cartItems.length === 0) {
      return `
        <div style="padding: 40px 16px; text-align: center;">
          <div style="font-size: 64px; margin-bottom: 16px;">🛒</div>
          <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">Your Cart is Empty</h3>
          <p style="font-size: 14px; color: var(--md-sys-color-on-surface-variant); margin-bottom: 24px;">
            Explore diagnostic tests and health packages to get started.
          </p>
          <button class="btn btn-primary" style="max-width: 240px; margin: 0 auto;" onclick="Router.navigate('home')">
            Browse Diagnostic Tests
          </button>
        </div>
      `;
    }

    return `
      <div style="padding: 16px;">
        <h3 style="font-size: 20px; font-weight: 800; margin-bottom: 16px; color: var(--md-sys-color-on-background);">
          Shopping Cart (${cartItems.length})
        </h3>

        <!-- Selected Tests List -->
        <div style="margin-bottom: 20px;">
          ${cartItems.map((item) => `
            <div class="card-glass" style="margin-bottom: 10px; padding: 14px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span class="chip chip-primary" style="font-size: 10px; margin-bottom: 4px;">${item.type}</span>
                <h5 style="font-size: 14px; font-weight: 700; color: var(--md-sys-color-on-surface);">${item.name}</h5>
                <div style="font-size: 14px; font-weight: 800; color: var(--md-sys-color-primary); margin-top: 4px;">₹${item.price}</div>
              </div>
              <button class="btn-icon" style="color: var(--md-sys-color-error);" onclick="CartView.removeItem('${item.id}', '${item.type}')">
                🗑️
              </button>
            </div>
          `).join("")}
        </div>

        <!-- Sample Collection Date & Time Picker -->
        <div class="card-glass" style="margin-bottom: 20px; padding: 16px;">
          <h4 style="font-size: 15px; font-weight: 700; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
            📅 Select Collection Slot
          </h4>
          
          <div class="form-group" style="margin-bottom: 14px;">
            <label class="form-label">Collection Date</label>
            <input type="date" class="form-input" value="${this.selectedDate}" min="${new Date().toISOString().split("T")[0]}" onchange="CartView.selectedDate = this.value">
          </div>

          <label class="form-label" style="margin-bottom: 6px; display: block;">Available Time Slots</label>
          <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px; -webkit-overflow-scrolling: touch;">
            ${this.timeSlots.map((slot) => `
              <button 
                onclick="CartView.setSlot('${slot}')"
                class="chip ${this.selectedSlot === slot ? "chip-primary" : ""}"
                style="padding: 8px 12px; cursor: pointer; white-space: nowrap; font-size: 12px;">
                ⏱ ${slot}
              </button>
            `).join("")}
          </div>
        </div>

        <!-- Address & Patient Selection -->
        <div class="card-glass" style="margin-bottom: 20px; padding: 16px;">
          <h4 style="font-size: 15px; font-weight: 700; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
            📍 Sample Collection Location
          </h4>
          
          <p style="font-size: 13px; color: var(--md-sys-color-on-surface); font-weight: 600; margin-bottom: 8px;">
            ${this.selectedAddress}
          </p>

          <button class="btn btn-outline" style="font-size: 12px; padding: 6px 12px; width: auto;" onclick="
            const newAddr = prompt('Enter Sample Collection Address:', CartView.selectedAddress);
            if(newAddr) { CartView.selectedAddress = newAddr; CartView.refreshView(); }
          ">
            ✏️ Change Address
          </button>
        </div>

        <!-- Coupon Code Application -->
        <div class="card-glass" style="margin-bottom: 20px; padding: 16px;">
          <h4 style="font-size: 15px; font-weight: 700; margin-bottom: 10px;">🏷️ Apply Promo Code</h4>
          
          ${this.appliedCoupon ? `
            <div style="display: flex; justify-content: space-between; align-items: center; background: var(--md-sys-color-success-container); color: var(--md-sys-color-success); padding: 10px 14px; border-radius: var(--radius-md);">
              <span style="font-weight: 700; font-size: 13px;">🎉 '${this.appliedCoupon.code}' Applied</span>
              <button class="btn-icon" style="width: auto; height: auto; color: var(--md-sys-color-error);" onclick="CartView.removeCoupon()">Remove</button>
            </div>
          ` : `
            <div style="display: flex; gap: 8px;">
              <input type="text" id="coupon-code-input" class="form-input" placeholder="Enter Coupon (e.g. WELCOME50)" style="text-transform: uppercase;">
              <button class="btn btn-secondary" style="width: auto; padding: 0 16px;" onclick="CartView.applyCoupon(document.getElementById('coupon-code-input').value)">Apply</button>
            </div>
          `}
        </div>

        <!-- Billing Breakdown Summary -->
        <div class="card-glass" style="margin-bottom: 24px; padding: 16px;">
          <h4 style="font-size: 15px; font-weight: 700; margin-bottom: 12px;">💳 Order Summary</h4>
          
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; color: var(--md-sys-color-on-surface-variant);">
            <span>Item Subtotal</span>
            <span>₹${summary.subtotal}</span>
          </div>

          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; color: var(--md-sys-color-on-surface-variant);">
            <span>Home Sample Collection Fee</span>
            <span>${summary.homeCollectionFee === 0 ? "<strong style='color:var(--md-sys-color-success);'>FREE</strong>" : `₹${summary.homeCollectionFee}`}</span>
          </div>

          ${summary.discountAmount > 0 ? `
            <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; color: var(--md-sys-color-success);">
              <span>Coupon Discount</span>
              <span>- ₹${summary.discountAmount}</span>
            </div>
          ` : ""}

          <hr style="border: none; border-top: 1px dashed var(--md-sys-color-outline); margin: 12px 0;">

          <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 800; color: var(--md-sys-color-on-surface);">
            <span>To Pay</span>
            <span style="color: var(--md-sys-color-primary);">₹${summary.finalAmount}</span>
          </div>
        </div>

        <!-- Proceed to Checkout Button -->
        <button class="btn btn-primary" style="height: 52px; font-size: 16px;" onclick="Router.navigate('payment')">
          Proceed to Payment (₹${summary.finalAmount}) →
        </button>
      </div>
    `;
  }
};

window.CartView = CartView;
