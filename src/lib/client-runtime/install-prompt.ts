/**
 * Install Prompt Hooks
 * Handles the BeforeInstallPromptEvent lifecycle for PWA installation.
 */

import { writable } from 'svelte/store';

export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface InstallPromptState {
  supported: boolean;
  deferredPrompt: BeforeInstallPromptEvent | null;
}

const state: InstallPromptState = {
  supported: typeof window !== 'undefined' && 'BeforeInstallPromptEvent' in window,
  deferredPrompt: null,
};

/**
 * Reactive store for install prompt availability.
 * UI components can subscribe to this to show/hide install buttons.
 */
export const installPromptReady = writable<boolean>(false);

/**
 * Check if the browser supports the install prompt API.
 */
export function isInstallPromptSupported(): boolean {
  return state.supported;
}

/**
 * Get the current deferred install prompt, if any.
 */
export function getDeferredPrompt(): BeforeInstallPromptEvent | null {
  return state.deferredPrompt;
}

/**
 * Register the beforeinstallprompt event listener.
 * Call this once at app startup.
 */
export function initInstallPrompt(onPromptReady?: (prompt: BeforeInstallPromptEvent) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = (e: Event) => {
    e.preventDefault();
    state.deferredPrompt = e as BeforeInstallPromptEvent;
    installPromptReady.set(true);
    onPromptReady?.(state.deferredPrompt);
  };

  window.addEventListener('beforeinstallprompt', handler);
  return () => window.removeEventListener('beforeinstallprompt', handler);
}

/**
 * Show the install prompt and return the user's choice.
 * Returns 'accepted' | 'dismissed' | null (if no prompt available).
 */
export async function showInstallPrompt(): Promise<'accepted' | 'dismissed' | null> {
  const prompt = state.deferredPrompt;
  if (!prompt) return null;

  await prompt.prompt();
  const { outcome } = await prompt.userChoice;
  state.deferredPrompt = null;
  installPromptReady.set(false);
  return outcome;
}
