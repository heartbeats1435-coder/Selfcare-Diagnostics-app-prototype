/**
 * Selfcare Diagnostics - Live GPS Tracking & Google Maps Controller
 * Real-Time Technician Tracking & Location Services
 */

const TrackingView = {
  mapInstance: null,
  technicianMarker: null,
  customerMarker: null,
  trackingInterval: null,
  
  // Active tracking state
  activeTrackingData: {
    bookingId: "BK_LIVE_9082",
    technicianName: "Karthik Raja",
    phone: "+91 9840123456",
    vehicleNumber: "TN 01 AB 4590",
    status: "On The Way",
    currentLat: 13.0850,
    currentLng: 80.2720,
    destLat: 13.0827,
    destLng: 80.2707,
    etaMinutes: 12,
    distanceKm: 2.4
  },

  /**
   * Load Google Maps JS API script dynamically
   */
  loadGoogleMapsAPI() {
    return new Promise((resolve) => {
      if (window.google && window.google.maps) {
        resolve(true);
        return;
      }

      const apiKey = APP_CONFIG.GOOGLE_MAPS_API_KEY;
      if (!apiKey || apiKey.includes("YOUR_GOOGLE_MAPS_API_KEY")) {
        console.warn("[Tracking] Google Maps API key missing. Using Canvas Interactive Map Fallback.");
        resolve(false);
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMapCallback`;
      script.async = true;
      script.defer = true;
      
      window.initMapCallback = () => resolve(true);
      script.onerror = () => resolve(false);
      
      document.body.appendChild(script);
    });
  },

  /**
   * Initialize Map Element
   */
  async initMap() {
    const mapElement = document.getElementById("google-map-container");
    if (!mapElement) return;

    const hasGoogleMaps = await this.loadGoogleMapsAPI();

    if (hasGoogleMaps && window.google && window.google.maps) {
      const centerPos = { lat: this.activeTrackingData.currentLat, lng: this.activeTrackingData.currentLng };
      
      this.mapInstance = new google.maps.Map(mapElement, {
        zoom: 15,
        center: centerPos,
        disableDefaultUI: true,
        zoomControl: true
      });

      // Technician Marker
      this.technicianMarker = new google.maps.Marker({
        position: centerPos,
        map: this.mapInstance,
        title: "Technician Location",
        icon: {
          url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
        }
      });

      // Customer Location Marker
      this.customerMarker = new google.maps.Marker({
        position: { lat: this.activeTrackingData.destLat, lng: this.activeTrackingData.destLng },
        map: this.mapInstance,
        title: "Collection Address",
        icon: {
          url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
        }
      });
    } else {
      // High-performance canvas fallback if key is unconfigured
      this.renderCanvasFallbackMap(mapElement);
    }

    // Start simulated GPS ping stream
    this.startLiveGPSUpdates();
  },

  /**
   * Interactive Canvas Fallback Map Visualizer
   */
  renderCanvasFallbackMap(container) {
    container.innerHTML = `
      <div style="width: 100%; height: 100%; background: #e2e8f0; border-radius: var(--radius-lg); display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; overflow: hidden; box-shadow: inset 0 0 20px rgba(0,0,0,0.1);">
        <div style="position: absolute; inset: 0; opacity: 0.15; background-image: radial-gradient(#0284c7 2px, transparent 2px); background-size: 20px 20px;"></div>
        
        <div style="z-index: 2; text-align: center; padding: 16px;">
          <div style="font-size: 36px; animation: pulse 2s infinite;">🛵</div>
          <p style="font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 8px;">
            Technician ${this.activeTrackingData.technicianName} is ${this.activeTrackingData.distanceKm} km away
          </p>
          <span class="chip chip-primary" style="margin-top: 8px; font-size: 12px;">
            ⏱ ETA: ~${this.activeTrackingData.etaMinutes} mins
          </span>
        </div>
      </div>
    `;
  },

  /**
   * Simulate Real-Time GPS Tracking Updates
   */
  startLiveGPSUpdates() {
    if (this.trackingInterval) clearInterval(this.trackingInterval);

    this.trackingInterval = setInterval(() => {
      if (this.activeTrackingData.etaMinutes > 1) {
        this.activeTrackingData.etaMinutes -= 1;
        this.activeTrackingData.distanceKm = (this.activeTrackingData.distanceKm - 0.2).toFixed(1);
        
        // Update DOM elements
        const etaElem = document.getElementById("live-eta-display");
        const distElem = document.getElementById("live-dist-display");
        
        if (etaElem) etaElem.innerText = `${this.activeTrackingData.etaMinutes} mins`;
        if (distElem) distElem.innerText = `${this.activeTrackingData.distanceKm} km`;
      } else {
        clearInterval(this.trackingInterval);
        const etaElem = document.getElementById("live-eta-display");
        if (etaElem) etaElem.innerText = "Arrived at location!";
        AppCore.showToast("Phlebotomist has arrived at your address!", "success");
      }
    }, 10000); // Updates every 10s
  },

  /**
   * Directly Call Technician
   */
  callTechnician() {
    window.location.href = `tel:${this.activeTrackingData.phone}`;
  },

  /**
   * Render Tracking Screen View
   */
  renderTracking() {
    // Initialize Google Map after DOM insertion
    setTimeout(() => this.initMap(), 100);

    return `
      <div style="padding: 16px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
          <h3 style="font-size: 20px; font-weight: 800;">Technician Live Tracking</h3>
          <span class="chip chip-success">● LIVE</span>
        </div>

        <!-- Google Map Mount Frame -->
        <div id="google-map-container" style="width: 100%; height: 260px; border-radius: var(--radius-xl); margin-bottom: 20px; overflow: hidden; box-shadow: var(--md-elevation-2);">
          <p style="text-align: center; padding-top: 100px; color: var(--md-sys-color-on-surface-variant);">Loading Live GPS Map...</p>
        </div>

        <!-- Technician Info Card -->
        <div class="card-glass" style="margin-bottom: 20px; padding: 16px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container); font-size: 20px; font-weight: bold; display: flex; align-items: center; justify-content: center;">
                👨‍⚕️
              </div>
              <div>
                <h4 style="font-size: 16px; font-weight: 700;">${this.activeTrackingData.technicianName}</h4>
                <p style="font-size: 12px; color: var(--md-sys-color-on-surface-variant);">Certified Senior Phlebotomist</p>
              </div>
            </div>

            <button class="btn btn-primary" style="width: auto; padding: 8px 16px; font-size: 13px;" onclick="TrackingView.callTechnician()">
              📞 Call
            </button>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: var(--md-sys-color-surface-variant); padding: 12px; border-radius: var(--radius-md);">
            <div>
              <span style="font-size: 11px; color: var(--md-sys-color-on-surface-variant); text-transform: uppercase; font-weight: 600;">Estimated Arrival</span>
              <div id="live-eta-display" style="font-size: 16px; font-weight: 800; color: var(--md-sys-color-primary);">${this.activeTrackingData.etaMinutes} mins</div>
            </div>
            <div>
              <span style="font-size: 11px; color: var(--md-sys-color-on-surface-variant); text-transform: uppercase; font-weight: 600;">Distance</span>
              <div id="live-dist-display" style="font-size: 16px; font-weight: 800; color: var(--md-sys-color-on-surface);">${this.activeTrackingData.distanceKm} km</div>
            </div>
          </div>
        </div>

        <!-- Sample Safety Protocols -->
        <div class="card-glass" style="padding: 16px;">
          <h5 style="font-size: 13px; font-weight: 700; margin-bottom: 8px; color: var(--md-sys-color-primary);">🛡️ Selfcare Safety Standard</h5>
          <p style="font-size: 12px; color: var(--md-sys-color-on-surface-variant); line-height: 1.4;">
            Your technician carries sealed, single-use vacuum blood collection tubes and temperature-controlled cold chain transport containers.
          </p>
        </div>
      </div>
    `;
  }
};

window.TrackingView = TrackingView;
