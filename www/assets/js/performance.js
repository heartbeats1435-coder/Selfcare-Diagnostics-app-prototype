/**
 * Selfcare Diagnostics - Performance Optimization Module
 */

const PerformanceEngine = {
  init() {
    this.enableLazyLoading();
    this.monitorMemoryUsage();
  },

  /**
   * IntersectionObserver for Image Lazy Loading
   */
  enableLazyLoading() {
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute("data-src");
          }
          obs.unobserve(img);
        }
      });
    });

    document.querySelectorAll("img[data-src]").forEach((img) => observer.observe(img));
  },

  /**
   * Log Client Memory & Speed Metrics
   */
  monitorMemoryUsage() {
    if (performance && performance.memory) {
      const usedMB = Math.round(performance.memory.usedJSHeapSize / (1024 * 1024));
      console.log(`[Performance] Used JS Heap: ${usedMB} MB`);
    }
  }
};

window.addEventListener("DOMContentLoaded", () => PerformanceEngine.init());
