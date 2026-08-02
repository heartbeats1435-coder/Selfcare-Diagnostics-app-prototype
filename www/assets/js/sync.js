/**
 * Selfcare Diagnostics - Offline Synchronization Engine
 * Manages Offline Request Queue, Retry Logic & Automatic Background Sync
 */

const SyncEngine = {
  /**
   * Initialize Offline Sync Listeners
   */
  init() {
    window.addEventListener("online", () => {
      this.processOfflineQueue();
    });

    // Attempt initial sync on boot if online
    if (navigator.onLine) {
      setTimeout(() => this.processOfflineQueue(), 3000);
    }
  },

  /**
   * Push Action to Offline Queue when Network Fails
   */
  queueOfflineAction(action, payload) {
    let queue = [];
    try {
      queue = JSON.parse(localStorage.getItem(APP_CONFIG.STORAGE_KEYS.OFFLINE_QUEUE) || "[]");
    } catch (e) {
      queue = [];
    }

    queue.push({
      action: action,
      payload: payload,
      timestamp: new Date().toISOString()
    });

    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
    AppCore.showToast("Action saved offline. Will sync when reconnected.", "warning");
  },

  /**
   * Process and Flush Offline Queue to Backend
   */
  async processOfflineQueue() {
    if (!navigator.onLine) return;

    let queue = [];
    try {
      queue = JSON.parse(localStorage.getItem(APP_CONFIG.STORAGE_KEYS.OFFLINE_QUEUE) || "[]");
    } catch (e) {
      queue = [];
    }

    if (queue.length === 0) return;

    AppCore.showToast(`Syncing ${queue.length} offline action(s)...`, "info");

    let remainingQueue = [];

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      try {
        const res = await API.post(item.action, item.payload);
        if (!res || res.status !== "success") {
          remainingQueue.push(item); // Keep in queue if failed
        }
      } catch (err) {
        remainingQueue.push(item);
      }
    }

    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(remainingQueue));

    if (remainingQueue.length === 0) {
      AppCore.showToast("All offline records synchronized successfully!", "success");
    }
  }
};

// Initialize Sync Engine on load
window.addEventListener("load", () => SyncEngine.init());

window.SyncEngine = SyncEngine;
