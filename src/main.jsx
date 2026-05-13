import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// ── Lightweight Web Vitals monitoring ──────────────────────────────────────
// Measures FCP, LCP, CLS, TTI and logs to console.
// Targets: FCP < 2.5s | LCP < 2.5s | CLS < 0.1 | TTI < 3.5s
function monitorWebVitals() {
  if (typeof window === 'undefined' || !window.PerformanceObserver) return;

  const report = (name, value, rating) => {
    const emoji = rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌';
    console.log(`[WebVitals] ${emoji} ${name}: ${typeof value === 'number' ? value.toFixed(1) + 'ms' : value} (${rating})`);
  };

  // FCP — First Contentful Paint (target < 2500ms)
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          const v = entry.startTime;
          report('FCP', v, v < 1800 ? 'good' : v < 3000 ? 'needs-improvement' : 'poor');
        }
      }
    }).observe({ type: 'paint', buffered: true });
  } catch (_) {}

  // LCP — Largest Contentful Paint (target < 2500ms)
  try {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1];
      if (last) {
        const v = last.startTime;
        report('LCP', v, v < 2500 ? 'good' : v < 4000 ? 'needs-improvement' : 'poor');
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (_) {}

  // CLS — Cumulative Layout Shift (target < 0.1)
  try {
    let clsValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) clsValue += entry.value;
      }
    }).observe({ type: 'layout-shift', buffered: true });
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        report('CLS', clsValue.toFixed(4), clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs-improvement' : 'poor');
      }
    }, { once: true });
  } catch (_) {}

  // TTI approximation via Long Tasks API
  try {
    const longTasks = [];
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) longTasks.push(entry);
    }).observe({ type: 'longtask', buffered: true });
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navEntry = performance.getEntriesByType('navigation')[0];
        const tti = navEntry ? navEntry.domInteractive : performance.now();
        report('TTI', tti, tti < 3500 ? 'good' : tti < 7300 ? 'needs-improvement' : 'poor');
        if (longTasks.length > 0) {
          console.log(`[WebVitals] 📊 Long tasks detected: ${longTasks.length} (may impact TTI)`);
        }
      }, 0);
    });
  } catch (_) {}
}

monitorWebVitals();

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)