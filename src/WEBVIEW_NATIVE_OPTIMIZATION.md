# WebView Mobile Optimization Guide

This document describes the native-like mobile WebView optimizations implemented in Scripture Space.

## Overview

Scripture Space is optimized for native WebView deployment on iOS and Android. Key improvements include:

1. **Native-style selection controls** – Mobile-friendly select dropdowns
2. **Pull-to-refresh functionality** – Swipe down to refresh page content
3. **Safe area inset support** – Proper notch handling on iPhone/Android
4. **Back button navigation** – Consistent back buttons on all child screens
5. **Persistent tab stacks** – Each tab maintains its own navigation history
6. **Touch-optimized UI** – All interactive elements meet 44x44px minimum tap target

---

## 1. Native-Style Select Controls

### Components

- **`NativeSelect`** (components/ui/native-select)
  - Replaces HTML `<select>` elements on mobile
  - Desktop: Standard dropdown behavior
  - Mobile: Modal bottom sheet with scrollable options

### Usage

```jsx
import { NativeSelect } from '@/components/ui/native-select';

<NativeSelect 
  value={country}
  onChange={setCountry}
  label="Select country"
>
  <option value="">Choose...</option>
  <option value="US">United States</option>
  <option value="UK">United Kingdom</option>
</NativeSelect>
```

### Files Updated

- `pages/UserProfile` – Country & Timezone selection
- `pages/Settings` – App Language selection

---

## 2. Pull-to-Refresh Hook

### Hook

- **`usePullToRefresh`** (hooks/usePullToRefresh.js)
  - Detects pull gesture (swipe down from top)
  - Visual feedback with spring animation
  - Automatic callback triggering at 80px threshold

### Usage

```jsx
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

const MyPage = () => {
  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['myData'] });
  };

  const { isRefreshing, pullDistance } = usePullToRefresh(
    handleRefresh,
    'main' // container selector
  );

  return (
    <main className="overflow-y-auto">
      {/* Your content */}
    </main>
  );
};
```

### Implementation Tips

- Call on scrollable containers (`<main>`, `.scroll-container`)
- Triggered only when scrolled to top
- Prevents default scroll behavior during pull
- Works on iOS and Android WebViews

---

## 3. Safe Area Inset Support

### CSS Variables

```css
/* Applied globally in index.css */
padding-bottom: env(safe-area-inset-bottom);
padding-top: env(safe-area-inset-top);
padding-left: env(safe-area-inset-left);
padding-right: env(safe-area-inset-right);
```

### Viewport Meta Tag

Already configured in `index.html`:

```html
<meta name="viewport" content="
  width=device-width,
  initial-scale=1.0,
  viewport-fit=cover,
  user-scalable=no
" />
```

### Components Using Safe Areas

- **BottomNav** – `safe-bottom` utility class
- **AppLayout** – Dynamic padding in `pb-[calc(...+env(safe-area-inset-bottom))]`
- **MobileTopBar** – `pt-[env(safe-area-inset-top)]`

---

## 4. Back Button Component

### Component

- **`BackButton`** (components/shared/BackButton)
  - Shows on mobile child screens
  - Hides on desktop and root tab pages
  - 44x44px touch target

### Usage

```jsx
import BackButton from '@/components/shared/BackButton';

<div className="flex items-center gap-3">
  <BackButton variant="ghost" />
  <h1>Page Title</h1>
</div>
```

### Behavior

- Appears on non-root pages (e.g., `/BibleStudyDetail`, `/UserProfile`)
- Hidden on root pages (`/Home`, `/Feed`, `/Study`, etc.)
- Calls `navigate(-1)` by default
- Optional `onBack` callback for custom logic

---

## 5. Tab Stack Navigation

### Hook

- **`useTabStack`** (hooks/useTabStack.js)
  - Maintains separate navigation stacks per tab
  - Double-tap root tab resets to tab root
  - Navigation within tab adds to history

### How It Works

```
Tab: Home
Stack: [/Home] → [/Home, /UserProfile] → [/Home, /UserProfile, /Settings]

Double-tap Home tab
Stack resets to: [/Home]

Switch to Feed tab
Stack: [/Feed]

Back to Home tab
Stack: [/Home] (preserved)
```

### Implementation in AppLayout

```jsx
const handleTabSelect = useCallback((tabPath) => {
  if (selectedTab === tabPath) {
    // Re-selection: reset to root
    setDisplayPath(tabPath);
  }
  setSelectedTab(tabPath);
}, [selectedTab]);
```

---

## 6. Touch-Optimized UI

### Minimum Tap Target Size

All interactive elements enforce **44x44px** (WCAG 2.1 AAA):

- Buttons: `min-height: 2.75rem; min-width: 2.75rem;`
- Tailwind class: `.touch:w-touch` (maps to 2.75rem)

### Code Example

```jsx
<button className="w-11 h-11 flex items-center justify-center rounded-full">
  {/* Content */}
</button>
```

### Applied To

- BottomNav tabs
- BackButton
- Theme color picker
- All interactive buttons

---

## 7. iOS-Specific Optimizations

### WebView Configuration

```html
<!-- Disable zoom on double-tap -->
<meta name="viewport" content="user-scalable=no">

<!-- Support notches/dynamic island -->
<meta name="viewport" content="viewport-fit=cover">

<!-- Prevent text selection jitter -->
<style>
  * { -webkit-tap-highlight-color: transparent; }
  button { touch-action: manipulation; }
</style>
```

### CSS Enhancements

```css
/* Smooth momentum scrolling */
.overflow-y-auto { -webkit-overflow-scrolling: touch; }

/* Prevent elastic scroll bounce */
html { overscroll-behavior: none; }

/* Disable text selection on UI elements */
button { user-select: none; }
```

---

## 8. Android-Specific Optimizations

### WebView Configuration

```java
// In native Android WebView setup:
webView.getSettings().setJavaScriptEnabled(true);
webView.getSettings().setDomStorageEnabled(true);
webView.getSettings().setDatabaseEnabled(true);
webView.getSettings().setUseWideViewPort(true);
webView.getSettings().setLoadWithOverviewMode(true);
```

### CSS Enhancements

```css
/* Prevent Chrome bottom address bar hiding */
body { position: fixed; }

/* Handle status bar + navbar spacing */
padding-top: max(env(safe-area-inset-top), 44px);

/* Optimize scrolling performance */
main { will-change: transform; }
```

---

## 9. Testing Checklist

### Mobile WebView Testing

- [ ] All dropdowns use NativeSelect (no HTML `<select>`)
- [ ] Pull-to-refresh works on iOS and Android
- [ ] Back button appears on child screens
- [ ] Safe area insets respected (no content under notch)
- [ ] All tap targets are 44x44px minimum
- [ ] Tab navigation preserves history
- [ ] Double-tap on active tab resets to root
- [ ] No elastic scroll bounce (overscroll-behavior)
- [ ] Smooth momentum scrolling enabled
- [ ] Dark mode respects system preference

### Browser DevTools Testing

```
Chrome DevTools > Device Emulation
- iPhone 14 (375×812)
- Pixel 6 (412×915)
- Test in responsive mode

Firefox > Responsive Design Mode
- Toggle "Touch Simulation" on
- Verify pull-to-refresh gesture
```

### Network Throttling

Test on 3G network:
- Chrome DevTools > Network tab
- Throttle to "Slow 3G"
- Verify loading states and skeleton screens

---

## 10. Performance Metrics

### Target Metrics

- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms
- **Time to Interactive (TTI)**: < 3.5s

### Monitoring

Use Chrome DevTools Lighthouse:

```
Audit > Mobile Configuration
- Throttle: Slow 4G
- CPU: 4x slowdown
```

---

## 11. Troubleshooting

### Pull-to-Refresh Not Working

```javascript
// Check if container scrollTop is 0
console.log('scrollTop:', container.scrollTop);

// Ensure touch events are not prevented
// Remove e.preventDefault() outside pull zone
```

### Safe Areas Not Applied

```css
/* Verify viewport meta tag in index.html */
<meta name="viewport" content="viewport-fit=cover">

/* Check CSS variable fallbacks */
padding-bottom: max(1rem, env(safe-area-inset-bottom));
```

### Back Button Not Showing

```javascript
// Verify current path logic
const isChildPage = !['Home', 'Feed', 'Study', ...].some(...);

// Check window.innerWidth for mobile detection
console.log('isMobile:', window.innerWidth < 768);
```

---

## 12. Future Enhancements

- [ ] App-level haptic feedback (vibration on tap)
- [ ] Native share sheet integration
- [ ] Offline support with Service Workers
- [ ] App shortcuts (Home Screen quick actions)
- [ ] Custom keyboard safe area support
- [ ] Gesture-based navigation (swipe back)

---

## References

- [MDN: viewport-fit](https://developer.mozilla.org/en-US/docs/Web/CSS/viewport-fit)
- [WebKit: -webkit-overflow-scrolling](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariCSSRef/Articles/StandardCSSProperties.html)
- [Android WebView Docs](https://developer.android.com/guide/webapps/webview)
- [WCAG 2.1 AAA: Touch Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)