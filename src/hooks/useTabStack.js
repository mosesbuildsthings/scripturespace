import { useState, useCallback, useRef } from 'react';

/**
 * Manages persistent navigation stacks for each tab.
 * On tab re-selection, resets to root of that tab.
 * Preserves navigation history within each tab.
 */
export function useTabStack() {
  const [activeTab, setActiveTab] = useState('/Home');
  const stacksRef = useRef({
    '/Home': ['/Home'],
    '/Feed': ['/Feed'],
    '/Study': ['/Study'],
    '/BibleStudy': ['/BibleStudy'],
    '/Groups': ['/Groups'],
    '/UserProfile': ['/UserProfile'],
  });

  const getActiveStack = useCallback(() => {
    return stacksRef.current[activeTab] || [activeTab];
  }, [activeTab]);

  const navigate = useCallback((path) => {
    const tabRoot = Object.keys(stacksRef.current).find(tab => path.startsWith(tab));
    if (!tabRoot) return;

    if (tabRoot === activeTab) {
      // Same tab: push to stack
      const stack = stacksRef.current[tabRoot];
      if (stack[stack.length - 1] !== path) {
        stack.push(path);
      }
    } else {
      // Different tab: reset to that tab's root or path
      setActiveTab(tabRoot);
      stacksRef.current[tabRoot] = [path === tabRoot ? tabRoot : path];
    }
  }, [activeTab]);

  const selectTab = useCallback((tabPath) => {
    if (tabPath === activeTab) {
      // Re-selection: reset to root
      stacksRef.current[tabPath] = [tabPath];
    } else {
      // New tab selection
      setActiveTab(tabPath);
    }
  }, [activeTab]);

  const goBack = useCallback(() => {
    const stack = stacksRef.current[activeTab];
    if (stack.length > 1) {
      stack.pop();
      return stack[stack.length - 1];
    }
    return stack[0];
  }, [activeTab]);

  return {
    activeTab,
    selectTab,
    navigate,
    goBack,
    currentPath: getActiveStack()[getActiveStack().length - 1],
  };
}