# Native WebView Mobile Optimization Guide

## Overview
Scripture Space is optimized for native Android/iOS WebView deployment with persistent tab stacks, 44x44px touch targets, and mobile performance enhancements.

---

## 1. Touch Target Compliance

### 44x44px Minimum (WCAG 2.1 AAA)
- **Bottom tab buttons**: 44x44px minimum hit area
- **All interactive elements**: Minimum 44x44px
- **Link/button padding**: Includes padding in tap target calculation
- **Implementation**: CSS `min-height` and `min-width` applied globally

### Mobile-Specific Classes
```html
<!-- Buttons automatically sized for mobile -->
<button class="h-11 w-11">  <!-- 44x44px -->
  <Icon className="w-5 h-5" />
</button>
```

---

## 2. Persistent Tab Navigation

### Tab Stack Behavior
- **Initial load**: Each tab loads its root page
- **Navigation within tab**: Maintains navigation history (e.g., Feed → Post → Comments)
- **Tab switching**: Preserves navigation stack per tab
- **Double-tap on active tab**: Resets tab to root page

### Implementation
Tabs are managed at the AppLayout level:
- `/Home` → Home tab stack
- `/Feed` → Feed tab stack  
- `/Study` → Study tab stack
- `/BibleStudy` → Bible Study tab stack
- `/Groups` → Groups tab stack
- `/UserProfile` → Profile tab stack

### Tab Root Reset Example
```
User flow:
1. Open app → `/Home` (default)
2. Tap "Feed" tab → `/Feed` (loads Feed)
3. Click post → `/Feed/123` (within Feed stack)
4. Tap "Feed" again → `/Feed` (reset to root)
```

---

## 3. Overscroll Prevention

### CSS Implementation
```css
html, body, main {
  overscroll-behavior: none;
  -webkit-overflow-scrolling: touch;
}
```

### Purpose
- Prevents elastic "bounce" scroll effect on mobile
- Stops app from zooming/bouncing when user scrolls past content limits
- Provides native app-like behavior
- Improves perceived performance

### Tab Content
All scrollable areas include `overscrollBehavior: 'none'` inline style to prevent momentum scrolling artifacts.

---

## 4. Mobile Performance Optimizations

### DOM Efficiency
- **Lazy rendering**: Route transitions use Framer Motion (avoid rendering hidden routes)
- **Memoization**: Components wrapped in `React.memo()` to prevent unnecessary re-renders
- **Outlet-based routing**: Single Outlet per layout prevents DOM bloat

### Blocking JavaScript Prevention
- **Code splitting**: Each page route loaded on-demand via React Router
- **Async data loading**: useQuery handles async fetches without blocking render
- **No synchronous timers**: All async operations are non-blocking
- **Image optimization**: All images are external URLs (no inline base64)

### CSS & Animation
- **GPU acceleration**: Framer Motion uses `transform` (not `position`)
- **Will-change**: Applied selectively to animated elements
- **CSS transitions**: Use `transition-all duration-200` (short durations)
- **Reduce motion**: Respects `prefers-reduced-motion` for accessibility

### Memory Management
- **Scroll virtualization**: Not needed for Scripture Space's use case
- **Event delegation**: Touch events handled at container level
- **Cleanup**: useEffect cleanup prevents memory leaks
- **Re-render optimization**: useCallback + useMemo prevent unnecessary updates

---

## 5. Touch & Input Handling

### Safe Area Insets (Notch Support)
```css
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);
```

iOS notch and Android safe areas automatically handled in MobileTopBar and BottomNav.

### Double-Tap Handling
- Disabled on buttons/links: `touch-action: manipulation`
- 300ms tap delay removed
- Consistent tap feedback across platforms

### Text Selection
- Disabled on UI elements: `user-select: none`
- Enabled for content (posts, comments, verses)

---

## 6. WebView Bridge Configuration

### For Android (Java/Kotlin)
```kotlin
webView.settings.apply {
  domStorageEnabled = true
  databaseEnabled = true
  allowFileAccess = true
  setSupportZoom(false)  // Disable pinch zoom
  builtInZoomControls = false
}

// Prevent bounce/overscroll
webView.overScrollMode = WebView.OVER_SCROLL_NEVER
```

### For iOS (Swift)
```swift
webView.scrollView.bounces = false
webView.scrollView.alwaysBounceVertical = false
webView.scrollView.alwaysBounceHorizontal = false
webView.configuration.preferences.minimumFontSize = 12
webView.allowsBackForwardNavigationGestures = true
```

---

## 7. Deployment Checklist

### Before Building Native App
- ✅ Test in mobile browser at `375px` width (iPhone SE)
- ✅ Test in mobile browser at `412px` width (Android)
- ✅ Verify all buttons are 44x44px minimum
- ✅ Test tab navigation and reset behavior
- ✅ Verify no scroll bounce/overscroll
- ✅ Check Lighthouse mobile score (target: 85+)
- ✅ Test offline behavior (if required)
- ✅ Verify all images load correctly
- ✅ Test on 4G network simulation (slow)

### Browser DevTools Testing
1. **Chrome DevTools**
   - Toggle Device Toolbar (Ctrl+Shift+M)
   - Select "iPhone SE" or "Pixel 5"
   - Disable throttling to baseline, then test 4G

2. **Network**
   - Throttle to "Slow 4G"
   - Verify all assets load (<3s total)
   - Check for render-blocking resources

3. **Performance**
   - Run Lighthouse audit
   - Target: 85+ mobile score
   - Monitor FCP, LCP, CLS

---

## 8. CSS Classes for Mobile Optimization

### Available Utility Classes
```css
/* Scrollbar hiding */
.scrollbar-none { scrollbar-width: none; }

/* Safe area support */
.safe-bottom { padding-bottom: env(safe-area-inset-bottom); }

/* Glass morphism (mobile optimized) */
.glass { backdrop-filter: blur(20px); }

/* GPU-accelerated glow */
.glow-primary { box-shadow: 0 0 14px hsl(var(--primary)/0.16); }

/* Prevent text selection */
.select-none { user-select: none; }

/* Touch feedback */
button { touch-action: manipulation; }
```

---

## 9. Performance Metrics

### Target Metrics
| Metric | Target | Current |
|--------|--------|---------|
| FCP (First Contentful Paint) | <2.5s | — |
| LCP (Largest Contentful Paint) | <2.5s | — |
| CLS (Cumulative Layout Shift) | <0.1 | — |
| TTI (Time to Interactive) | <3.5s | — |

### Optimization Strategy
1. **Code splitting**: Route-based chunking (React Router lazy)
2. **Image optimization**: External CDN, responsive sizes
3. **CSS optimization**: Tailwind purge enabled
4. **JS minification**: Vite handles automatically

---

## 10. Troubleshooting

### "App feels slow"
- Check network throttling (4G vs 5G)
- Monitor JavaScript execution time
- Profile with Chrome DevTools Performance tab
- Check for synchronous data loading

### "Scrolling is bouncy/elastic"
- Verify `overscroll-behavior: none` is applied
- Check WebView bridge settings (Android/iOS)
- Disable momentum scrolling if needed

### "Tab reset not working"
- Verify onClick handler on BottomTab
- Check `selectedTab` state management
- Ensure route structure matches PRIMARY_NAV

### "Touch targets too small"
- Verify `min-height: 2.75rem` on buttons
- Include padding in tap target (44px = 2.75rem)
- Test in DevTools Device Mode

---

## 11. Future Enhancements

- [ ] Service Worker for offline support
- [ ] WebView native module bridge for payments
- [ ] Haptic feedback on tab select (iOS/Android)
- [ ] App shortcuts on home screen
- [ ] Push notifications via FCM/APNs