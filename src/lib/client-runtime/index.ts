/**
 * CookieTap Client Runtime
 *
 * Dedicated PWA shell for browser lifecycle concerns:
 * - Service worker registration
 * - Install prompt management
 * - Page visibility / unload hooks
 * - Periodic and visibility-driven autosave
 *
 * This layer is entirely separate from gameplay math and persistence contracts.
 * It only orchestrates when saves happen and how the PWA install flow integrates.
 */

export { initInstallPrompt, isInstallPromptSupported, getDeferredPrompt, showInstallPrompt, installPromptReady } from './install-prompt';
export type { InstallPromptState } from './install-prompt';

export { initVisibilityHooks, isPageVisible, isPageHidden } from './visibility';
export type { VisibilityCallbacks } from './visibility';

export { startAutosave } from './autosave';
export type { AutosaveOptions } from './autosave';

import { initInstallPrompt } from './install-prompt';
import { initVisibilityHooks } from './visibility';
import { startAutosave } from './autosave';
import type { GameState } from '../game/schema';
import { saveGame } from '../game/persistence';

export interface ClientRuntimeOptions {
  /** Get the current game state (called at save time) */
  getState: () => GameState;
  /** Called when the install prompt becomes available */
  onInstallPromptReady?: () => void;
  /** Called when the page becomes visible again */
  onPageVisible?: () => void;
  /** Called when the page goes to background */
  onPageHidden?: () => void;
}

/**
 * Initialize the full client runtime.
 * Call once at app startup (e.g., in +layout.svelte).
 * Returns a cleanup function.
 */
export function initClientRuntime(options: ClientRuntimeOptions): () => void {
  const { getState, onInstallPromptReady, onPageVisible, onPageHidden } = options;
  const cleanupFns: Array<() => void> = [];

  // Service worker registration (if available in browser)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/service-worker.js')
      .catch((err) => console.warn('Service worker registration failed:', err));
  }

  // Install prompt
  const uninstallInstallPrompt = initInstallPrompt(() => {
    onInstallPromptReady?.();
  });
  cleanupFns.push(uninstallInstallPrompt);

  // Visibility & unload hooks
  const uninstallVisibility = initVisibilityHooks({
    onVisible: onPageVisible,
    onHidden: onPageHidden,
    onUnload: (type) => {
      // Best-effort save on unload
      try {
        saveGame(getState());
      } catch {
        // Best-effort
      }
    },
  });
  cleanupFns.push(uninstallVisibility);

  // Autosave loop
  const stopAutosave = startAutosave(getState, {
    interval: 5000,
    saveOnHide: true,
    saveOnUnload: true,
  });
  cleanupFns.push(stopAutosave);

  return () => cleanupFns.forEach((fn) => fn());
}
