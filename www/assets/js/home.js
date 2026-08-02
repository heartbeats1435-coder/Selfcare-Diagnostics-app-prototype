/**
 * Selfcare Diagnostics - Home Screen & Search Engine
 * Handles Catalog Fetching, Category Filtering & Live Search
 */

const HomeView = {
  categories: [
    { id: "all", name: "All Tests", icon: "🔬" },
    { id: "Hematology", name: "Blood Count", icon: "🩸" },
    { id: "Diabetic Care", name: "Diabetes", icon: "🍬" },
    { id: "Biochemistry", name: "Liver & Kidney", icon: "🫘" },
    { id: "Endocrinology", name: "Thyroid", icon: "🦋" },
    { id: "Packages", name: "Full Packages", icon: "📦" }
  ],

  selectedCategory: "all",
  searchQuery: "",
  testsList: [],
  isLoading: false,

  /**
   * Fetch Tests from API or Local Cache
   */
  async loadCatalog() {
    this.isLoading = true;
    this.refreshView();

    const response = await API.get("get_public_tests");
    this.isLoading = false;

    if (response && response.status === "success" && Array.isArray(response.data)) {
      this.testsList = response.data;
    } else {
      // Fallback offline mock data if backend request pending initial deployment
      this.testsList = [
        { Test_ID: "TST001", Test_Code: "CBC01", Test_Name: "Complete Blood Count (CBC)", Category: "Hematology", Price: 350, Discount_Price: 299, Fasting_Required: "No", Turnaround_Time: "24 Hours" },
        { Test_ID: "TST002", Test_Code: "FBS01", Test_Name: "Fasting Blood Sugar (FBS)", Category: "Diabetic Care", Price: 150, Discount_Price: 99, Fasting_Required: "Yes (8 hrs)", Turnaround_Time: "12 Hours" },
        { Test_ID: "TST003", Test_Code: "LFT01", Test_Name: "Liver Function Test (LFT)", Category: "Biochemistry", Price: 850, Discount_Price: 699, Fasting_Required: "Yes (8 hrs)", Turnaround_Time: "24 Hours" },
        { Test_ID: "TST004", Test_Code: "KFT01", Test_Name: "Kidney Function Test (KFT)", Category: "Biochemistry", Price: 800, Discount_Price: 649, Fasting_Required: "No", Turnaround_Time: "24 Hours" },
        { Test_ID: "TST005", Test_Code: "THY01", Test_Name: "Thyroid Profile (T3, T4, TSH)", Category: "Endocrinology", Price: 600, Discount_Price: 499, Fasting_Required: "No", Turnaround_Time: "24 Hours" }
      ];
    }
    this.refreshView();
  },

  /**
   * Select Category Filter
   */
  setCategory(catId) {
    this.selectedCategory = catId;
    this.refreshView();
  },

  /**
   * Filter Search Query
   */
  setSearchQuery(query) {
    this.searchQuery = query.toLowerCase().trim();
    this.refreshView();
  },

  /**
   * Filtered Tests Getter
   */
  getFilteredTests() {
    return this.testsList.filter((test) => {
      const matchesCat = this.selectedCategory === "all" || test.Category === this.selectedCategory;
      const matchesQuery = !this.searchQuery || 
        test.Test_Name.toLowerCase().includes(this.searchQuery) ||
        test.Category.toLowerCase().includes(this.searchQuery) ||
        test.Test_Code.toLowerCase().includes(this.searchQuery);
      return matchesCat && matchesQuery;
    });
  },

  /**
   * Quick Add to Cart
   */
  addToCart(testId) {
    const test = this.testsList.find((t) => t.Test_ID === testId);
    if (test) {
      const added = Store.addToCart({
        id: test.Test_ID,
        type: "Test",
        name: test.Test_Name,
        price: test.Discount_Price || test.Price,
        originalPrice: test.Price
      });

      if (added) {
        AppCore.showToast(`Added ${test.Test_Name} to cart`, "success");
      } else {
        AppCore.showToast(`${test.Test_Name} is already in your cart`, "info");
      }
    }
  },

  /**
   * Refresh DOM view
   */
  refreshView() {
    const container = document.getElementById("main-content");
    if (container && Store.state.currentRoute === "home") {
      container.innerHTML = this.render();
    }
  },

  /**
   * Main Render Function
   */
  render() {
    const user = Store.state.user || { fullName: "Guest User" };
    const filteredList = this.getFilteredTests();

    return `
      <div style="padding: 16px;">
        <!-- Header Greetings Bar -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            <span style="font-size: 11px; color: var(--md-sys-color-on-surface-variant); text-transform: uppercase; font-weight: 700;">Deliver To</span>
            <div style="font-size: 14px; font-weight: 700; display: flex; align-items: center; gap: 4px; color: var(--md-sys-color-primary);">
              📍 ${Store.state.selectedLocation.city} <span style="font-size: 10px;">▼</span>
            </div>
          </div>
          <div class="chip chip-primary" style="font-size: 12px;">👋 ${user.fullName.split(" ")[0]}</div>
        </div>

        <!-- Search & Voice Search Bar -->
        <div style="position: relative; margin-bottom: 20px;">
          <input type="text" 
            class="form-input" 
            placeholder="Search blood tests, diabetes, thyroid..." 
            value="${this.searchQuery}"
            oninput="HomeView.setSearchQuery(this.value)"
            style="padding-left: 42px; padding-right: 42px; height: 48px; border-radius: var(--radius-full); box-shadow: var(--md-elevation-1);">
          
          <span style="position: absolute; left: 14px; top: 13px; font-size: 18px; color: var(--md-sys-color-on-surface-variant);">🔍</span>
          
          <button class="btn-icon" 
            style="position: absolute; right: 8px; top: 6px; width: 36px; height: 36px;"
            onclick="AppCore.showToast('Voice Search active: Listening...', 'info')">
            🎤
          </button>
        </div>

        <!-- Promo Banner -->
        <div class="card-glass" style="background: linear-gradient(135deg, #0284c7, #6366f1); color: white; padding: 20px; border-radius: var(--radius-xl); margin-bottom: 24px; box-shadow: var(--md-elevation-2);">
          <span style="background: rgba(255,255,255,0.25); padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; text-transform: uppercase;">SPECIAL OFFER</span>
          <h3 style="font-size: 20px; margin-top: 10px; font-weight: 800; line-height: 1.2;">Full Body Executive Package</h3>
          <p style="font-size: 13px; opacity: 0.92; margin-top: 6px;">80+ Health Markers including Vitamin D & B12</p>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 16px;">
            <div>
              <span style="font-size: 20px; font-weight: 800;">₹999</span>
              <span style="font-size: 12px; text-decoration: line-through; opacity: 0.8; margin-left: 6px;">₹2,499</span>
            </div>
            <button class="btn" style="background: white; color: #0284c7; width: auto; padding: 8px 18px; font-weight: 700;" onclick="HomeView.addToCart('TST001')">
              Book Now
            </button>
          </div>
        </div>

        <!-- Categories horizontal pills -->
        <div style="margin-bottom: 24px;">
          <h4 style="font-size: 16px; font-weight: 700; margin-bottom: 12px; color: var(--md-sys-color-on-background);">Categories</h4>
          <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px; -webkit-overflow-scrolling: touch;">
            ${this.categories.map((cat) => `
              <div 
                onclick="HomeView.setCategory('${cat.id}')"
                class="chip ${this.selectedCategory === cat.id ? "chip-primary" : ""}"
                style="padding: 10px 16px; border-radius: var(--radius-full); cursor: pointer; white-space: nowrap; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 6px; box-shadow: var(--md-elevation-1);">
                <span>${cat.icon}</span>
                <span>${cat.name}</span>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Catalog Tests Section -->
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h4 style="font-size: 16px; font-weight: 700; color: var(--md-sys-color-on-background);">
              ${this.selectedCategory === "all" ? "Popular Diagnostic Tests" : this.selectedCategory}
            </h4>
            <span style="font-size: 12px; color: var(--md-sys-color-on-surface-variant); font-weight: 600;">${filteredList.length} Available</span>
          </div>

          ${this.isLoading ? `
            <div class="shimmer" style="height: 100px; margin-bottom: 12px; border-radius: var(--radius-lg);"></div>
            <div class="shimmer" style="height: 100px; margin-bottom: 12px; border-radius: var(--radius-lg);"></div>
          ` : filteredList.length === 0 ? `
            <div class="card-glass" style="text-align: center; padding: 32px 16px;">
              <p style="font-size: 14px; color: var(--md-sys-color-on-surface-variant);">No tests found matching "${this.searchQuery}"</p>
            </div>
          ` : filteredList.map((test) => `
            <div class="card-glass" style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; padding: 16px;">
              <div style="flex: 1; padding-right: 12px;">
                <span class="chip" style="font-size: 10px; padding: 2px 8px; margin-bottom: 6px;">${test.Category}</span>
                <h5 style="font-size: 15px; font-weight: 700; color: var(--md-sys-color-on-surface); margin-bottom: 4px;">${test.Test_Name}</h5>
                <div style="font-size: 12px; color: var(--md-sys-color-on-surface-variant); display: flex; gap: 12px;">
                  <span>⏱ ${test.Turnaround_Time}</span>
                  <span>🥣 ${test.Fasting_Required.startsWith("Yes") ? "Fasting Req." : "No Fasting"}</span>
                </div>
                <div style="margin-top: 8px;">
                  <span style="font-size: 16px; font-weight: 800; color: var(--md-sys-color-primary);">₹${test.Discount_Price || test.Price}</span>
                  ${test.Discount_Price ? `<span style="font-size: 12px; text-decoration: line-through; color: var(--md-sys-color-on-surface-variant); margin-left: 6px;">₹${test.Price}</span>` : ""}
                </div>
              </div>
              <button class="btn btn-primary" style="width: auto; padding: 8px 16px; font-size: 13px;" onclick="HomeView.addToCart('${test.Test_ID}')">
                + Add
              </button>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }
};

window.HomeView = HomeView;
