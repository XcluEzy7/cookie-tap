/**
 * Visibility & Unload Hooks
 * Centralized handling of page visibility changes and unload events.
 * Use this to pause/resume game loops and persist state on background/close.
 */

export interface VisibilityCallbacks {
  onVisible?: () => void;
  onHidden?: () => void;
  onUnload?: (type: 'unload' | 'beforeunload') => void;
}

/**
 * Register visibility change and unload listeners.
 * Returns a cleanup function to remove all listeners.
 */
export function initVisibilityHooks(callbacks: VisibilityCallbacks): () => void {
  if (typeof window === 'undefined') return () => {};

  const cleanupFns: Array<() => void> = [];

  // Visibility change
  const visibilityHandler = () => {
    if (document.visibilityState === 'visible') {
      callbacks.onVisible?.();
    } else {
      callbacks.onHidden?.();
    }
  };
  document.addEventListener('visibilitychange', visibilityHandler);
  cleanupFns.push(() => document.removeEventListener('visibilitychange', visibilityHandler));

  // Before unload (most browsers)
  const beforeUnloadHandler = () => {
    callbacks.onUnload?.('beforeunload');
  };
  window.addEventListener('beforeunload', beforeUnloadHandler);
  cleanupFns.push(() => window.removeEventListener('beforeunload', beforeUnloadHandler));

  // Unload (fires less reliably but covers edge cases)
  const unloadHandler = () => {
    callbacks.onUnload?.('unload');
  };
  window.addEventListener('unload', unloadHandler);
  cleanupFns.push(() => window.removeEventListener('unload', unloadHandler));

  return () => cleanupFns.forEach((fn) => fn());
}

/**
 * Check if the document is currently visible.
 */
export function isPageVisible(): boolean {
  return typeof document !== 'undefined' && document.visibilityState === 'visible';
}

/**
 * Check if the page is in a background tab (hidden but not closed).
 */
export function isPageHidden(): boolean {
  return typeof document !== 'undefined' && document.visibilityState === 'hidden';
}
