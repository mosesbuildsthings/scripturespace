import { useEffect, useRef, useState } from 'react';

/**
 * Implements native-style pull-to-refresh for scrollable containers.
 * Provides visual feedback and triggering on mobile devices.
 */
export function usePullToRefresh(onRefresh, containerSelector = 'main') {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startYRef = useRef(0);
  const containerRef = useRef(null);
  const refreshThreshold = 80; // pixels to trigger refresh

  useEffect(() => {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    containerRef.current = container;

    const handleTouchStart = (e) => {
      // Only track if scrolled to top
      if (container.scrollTop === 0) {
        startYRef.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e) => {
      if (startYRef.current === 0 || container.scrollTop > 0) return;

      const currentY = e.touches[0].clientY;
      const distance = Math.max(0, currentY - startYRef.current);

      // Only allow pull if not already refreshing
      if (!isRefreshing) {
        setPullDistance(Math.min(distance, refreshThreshold * 1.5));
        
        // Prevent default only if pulling down
        if (distance > 10) {
          e.preventDefault?.();
        }
      }
    };

    const handleTouchEnd = () => {
      if (pullDistance >= refreshThreshold && !isRefreshing) {
        setIsRefreshing(true);
        setPullDistance(refreshThreshold);
        
        // Call the refresh callback
        Promise.resolve(onRefresh()).then(() => {
          setIsRefreshing(false);
          setPullDistance(0);
          startYRef.current = 0;
        });
      } else {
        // Spring back animation
        setPullDistance(0);
        startYRef.current = 0;
      }
    };

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isRefreshing, pullDistance, onRefresh, containerSelector]);

  return {
    isRefreshing,
    pullDistance,
    triggerRefresh: () => {
      if (!isRefreshing) {
        setIsRefreshing(true);
        Promise.resolve(onRefresh()).then(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        });
      }
    },
  };
}