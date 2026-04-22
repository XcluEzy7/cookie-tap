/**
 * Autosave Orchestration
 * Coordinates periodic saves, visibility-driven saves, and unload saves.
 * Does NOT implement save logic itself — delegates to the persistence layer.
 */

import { saveGame, extractSaveData } from '../game/persistence';
import type { GameState } from '../game/schema';

export interface AutosaveOptions {
  /** Interval in ms for periodic saves (default: 5000) */
  interval?: number;
  /** Whether to save on page hide (default: true) */
  saveOnHide?: boolean;
  /** Whether to save on unload (default: true) */
  saveOnUnload?: boolean;
  /** Called when a save completes */
  onSave?: (success: boolean) => void;
}

/**
 * Start the autosave orchestration loop.
 * Returns a stop function.
 */
export function startAutosave(
  getState: () => GameState,
  options: AutosaveOptions = {}
): () => void {
  const {
    interval = 5000,
    saveOnHide = true,
    saveOnUnload = true,
    onSave,
  } = options;

  const cleanupFns: Array<() => void> = [];

  // Periodic interval save
  const intervalId = setInterval(() => {
    const state = getState();
    const success = saveGame(state);
    onSave?.(success);
  }, interval);
  cleanupFns.push(() => clearInterval(intervalId));

  // Save on visibility hidden
  if (saveOnHide) {
    const visibilityHandler = () => {
      if (document.visibilityState === 'hidden') {
        const state = getState();
        saveGame(state);
      }
    };
    document.addEventListener('visibilitychange', visibilityHandler);
    cleanupFns.push(() => document.removeEventListener('visibilitychange', visibilityHandler));
  }

  // Save on unload
  if (saveOnUnload) {
    const unloadHandler = () => {
      const state = getState();
      // Use synchronous localStorage write on unload
      try {
        const saveData = extractSaveData(state);
        localStorage.setItem('cookieClickerSave', JSON.stringify(saveData));
      } catch {
        // Best-effort on unload
      }
    };
    window.addEventListener('beforeunload', unloadHandler);
    cleanupFns.push(() => window.removeEventListener('beforeunload', unloadHandler));
  }

  return () => cleanupFns.forEach((fn) => fn());
}
