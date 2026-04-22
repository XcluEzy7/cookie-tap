/**
 * CookieTap Persistence Module
 * Save/load and legacy migration for game state.
 *
 * Handles:
 * - Saving current game state to localStorage
 * - Loading and validating saved data
 * - Migrating legacy v1 saves to current v2 format
 */

import type {
  SaveDataV2,
  LegacySaveData,
  AnySaveData,
  GameState,
} from './schema';

import { SAVE_VERSION } from './schema';
import {
  BUILDINGS,
  PRESTIGE_UPGRADES,
  ACHIEVEMENTS,
  OFFLINE_MULTIPLIER_BASE,
} from './catalog';

import {
  createInitialGameState,
  calculateOfflineCookies,
  shouldShowOfflineProgress,
  getTotalCps,
  createAchievementCheckState,
  checkAchievements,
} from './engine';

/** LocalStorage key for game saves */
export const SAVE_KEY = 'cookieClickerSave';

// ============================================
// TYPE GUARDS
// ============================================

/**
 * Check if save data is the legacy v1 format.
 */
export function isLegacySave(data: AnySaveData): data is LegacySaveData {
  return !('version' in data);
}

/**
 * Check if save data is the current v2 format.
 */
export function isCurrentSave(data: AnySaveData): data is SaveDataV2 {
  return 'version' in data && data.version === SAVE_VERSION;
}

// ============================================
// SAVE FUNCTIONS
// ============================================

/**
 * Extract saveable data from game state.
 * Only persists what's needed - catalog data is not saved.
 */
export function extractSaveData(state: GameState): SaveDataV2 {
  return {
    version: SAVE_VERSION,
    cookies: state.cookies,
    totalCookies: state.totalCookies,
    totalCookiesAllTime: state.totalCookiesAllTime,
    clicks: state.clicks,
    clickPower: state.clickPower,
    globalMultiplier: state.globalMultiplier,
    clickMultiplier: state.clickMultiplier,
    offlineMultiplier: state.offlineMultiplier,
    heavenlyChips: state.heavenlyChips,
    totalHeavenlyChips: state.totalHeavenlyChips,
    prestigeCount: state.prestigeCount,
    buildings: Object.fromEntries(
      Object.entries(state.buildings).map(([k, v]) => [k, { owned: v.owned }])
    ),
    prestigeUpgrades: Object.fromEntries(
      Object.entries(state.prestigeUpgrades).map(([k, v]) => [k, { purchased: v.purchased }])
    ),
    achievements: Object.fromEntries(
      Object.entries(state.achievements).map(([k, v]) => [k, { unlocked: v.unlocked }])
    ),
    garden: {
      unlocked: state.garden.unlocked,
      plots: state.garden.plots,
      seeds: state.garden.seeds,
    },
    goldenCookiesClicked: state.goldenCookiesClicked,
    totalPlayTime: state.totalPlayTime,
    settings: { ...state.settings },
    startTime: state.startTime,
    lastSave: Date.now(),
    lastGoldenCookie: state.lastGoldenCookie,
  };
}

/**
 * Save game state to localStorage.
 * Returns true if successful.
 */
export function saveGame(state: GameState): boolean {
  try {
    const saveData = extractSaveData(state);
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    return true;
  } catch (e) {
    console.warn('Could not save game:', e);
    return false;
  }
}

// ============================================
// LEGACY MIGRATION
// ============================================

/**
 * Migrate legacy v1 save data to current v2 format.
 * Legacy saves have:
 * - cookies, totalCookies, clicks, clickPower
 * - buildings: { [key]: { owned: number } }
 * - lastSave
 *
 * Missing fields get default values.
 */
export function migrateLegacySave(legacy: LegacySaveData): SaveDataV2 {
  const now = Date.now();

  // Build default buildings and merge owned counts
  const buildings: Record<string, { owned: number }> = {};
  for (const key in BUILDINGS) {
    buildings[key] = {
      owned: legacy.buildings?.[key]?.owned ?? 0,
    };
  }

  // Build default prestige upgrades (all unpurchased)
  const prestigeUpgrades: Record<string, { purchased: boolean }> = {};
  for (const key in PRESTIGE_UPGRADES) {
    prestigeUpgrades[key] = { purchased: false };
  }

  // Build default achievements (all unlocked)
  const achievements: Record<string, { unlocked: boolean }> = {};
  for (const key in ACHIEVEMENTS) {
    achievements[key] = { unlocked: false };
  }

  return {
    version: SAVE_VERSION,
    cookies: legacy.cookies ?? 0,
    totalCookies: legacy.totalCookies ?? 0,
    totalCookiesAllTime: legacy.totalCookies ?? 0, // Use session total for legacy
    clicks: legacy.clicks ?? 0,
    clickPower: legacy.clickPower ?? 1,
    globalMultiplier: 1,
    clickMultiplier: 1,
    offlineMultiplier: OFFLINE_MULTIPLIER_BASE,
    heavenlyChips: 0,
    totalHeavenlyChips: 0,
    prestigeCount: 0,
    buildings,
    prestigeUpgrades,
    achievements,
    garden: {
      unlocked: false,
      plots: Array(12).fill(null),
      seeds: 3,
    },
    goldenCookiesClicked: 0,
    totalPlayTime: 0,
    settings: {
      soundEnabled: true,
      particlesEnabled: true,
      screenShakeEnabled: true,
      darkMode: false,
    },
    startTime: now,
    lastSave: legacy.lastSave ?? now,
    lastGoldenCookie: 0,
  };
}

// ============================================
// LOAD FUNCTIONS
// ============================================

/** Result of loading a save */
export interface LoadResult {
  /** Successfully loaded and migrated state */
  state: GameState;
  /** Whether this was a legacy save that needed migration */
  wasMigrated: boolean;
  /** Offline cookies earned (if any) */
  offlineCookies: number;
  /** Whether to show the offline progress modal */
  showOfflineModal: boolean;
}

/**
 * Parse and validate save data from localStorage.
 * Handles both legacy and current formats.
 */
export function parseSaveData(json: string): AnySaveData | null {
  try {
    const data = JSON.parse(json);
    return data;
  } catch (e) {
    console.warn('Could not parse save data:', e);
    return null;
  }
}

/**
 * Merge persisted save data with catalog defaults.
 * Catalog provides definitions; save provides persisted state.
 */
export function mergeSaveWithCatalog(save: SaveDataV2): GameState {
  // Start with defaults for any missing fields
  const defaults = createInitialGameState();

  // Merge buildings (owned from save, definitions from catalog)
  const buildings = { ...defaults.buildings };
  for (const key in BUILDINGS) {
    buildings[key] = {
      owned: save.buildings?.[key]?.owned ?? 0,
    };
  }

  // Merge prestige upgrades
  const prestigeUpgrades = { ...defaults.prestigeUpgrades };
  for (const key in PRESTIGE_UPGRADES) {
    prestigeUpgrades[key] = {
      purchased: save.prestigeUpgrades?.[key]?.purchased ?? false,
    };
  }

  // Merge achievements
  const achievements = { ...defaults.achievements };
  for (const key in ACHIEVEMENTS) {
    achievements[key] = {
      unlocked: save.achievements?.[key]?.unlocked ?? false,
    };
  }

  return {
    cookies: save.cookies ?? 0,
    totalCookies: save.totalCookies ?? 0,
    totalCookiesAllTime: save.totalCookiesAllTime ?? save.totalCookies ?? 0,
    clicks: save.clicks ?? 0,
    clickPower: save.clickPower ?? 1,
    globalMultiplier: save.globalMultiplier ?? 1,
    clickMultiplier: save.clickMultiplier ?? 1,
    offlineMultiplier: save.offlineMultiplier ?? OFFLINE_MULTIPLIER_BASE,
    heavenlyChips: save.heavenlyChips ?? 0,
    totalHeavenlyChips: save.totalHeavenlyChips ?? 0,
    prestigeCount: save.prestigeCount ?? 0,
    buildings,
    prestigeUpgrades,
    achievements,
    garden: save.garden ?? defaults.garden,
    goldenCookiesClicked: save.goldenCookiesClicked ?? 0,
    totalPlayTime: save.totalPlayTime ?? 0,
    settings: save.settings ?? defaults.settings,
    startTime: save.startTime ?? Date.now(),
    lastSave: save.lastSave ?? Date.now(),
    lastGoldenCookie: save.lastGoldenCookie ?? 0,
  };
}

/**
 * Load game state from localStorage.
 * Handles legacy migration and offline progress calculation.
 */
export function loadGame(): LoadResult {
  const defaults = createInitialGameState();

  try {
    const json = localStorage.getItem(SAVE_KEY);
    if (!json) {
      return {
        state: defaults,
        wasMigrated: false,
        offlineCookies: 0,
        showOfflineModal: false,
      };
    }

    let data = parseSaveData(json);
    if (!data) {
      return {
        state: defaults,
        wasMigrated: false,
        offlineCookies: 0,
        showOfflineModal: false,
      };
    }

    // Migrate legacy saves to current format
    let wasMigrated = false;
    if (isLegacySave(data)) {
      data = migrateLegacySave(data);
      wasMigrated = true;
    }

    // Ensure we have the current format
    if (!isCurrentSave(data)) {
      console.warn('Unknown save version, using defaults');
      return {
        state: defaults,
        wasMigrated: false,
        offlineCookies: 0,
        showOfflineModal: false,
      };
    }

    // Merge with catalog
    const state = mergeSaveWithCatalog(data);

    // Calculate offline progress
    const offlineMs = Date.now() - state.lastSave;
    const offlineSeconds = offlineMs / 1000;

    // Get current CPS for offline calculation
    const cps = getTotalCps(state);
    const hasOfflineBoost = state.prestigeUpgrades.offlineProduction?.purchased ?? false;
    const offlineCookies = calculateOfflineCookies(
      cps,
      offlineSeconds,
      state.offlineMultiplier,
      hasOfflineBoost
    );

    // Check if we should show offline modal
    const showOfflineModal = shouldShowOfflineProgress(offlineSeconds, cps);

    // Apply offline cookies if any
    // IMPORTANT: Credit all three cookie counters for prestige progress
    if (offlineCookies > 0) {
      state.cookies += offlineCookies;
      state.totalCookies += offlineCookies;
      state.totalCookiesAllTime += offlineCookies; // Required for prestige calculation
    }

    return {
      state,
      wasMigrated,
      offlineCookies,
      showOfflineModal,
    };
  } catch (e) {
    console.warn('Could not load save:', e);
    return {
      state: defaults,
      wasMigrated: false,
      offlineCookies: 0,
      showOfflineModal: false,
    };
  }
}

// ============================================
// RESET FUNCTION
// ============================================

/**
 * Clear all save data from localStorage.
 * Returns true if data was found and removed.
 */
export function clearSave(): boolean {
  try {
    const hadSave = localStorage.getItem(SAVE_KEY) !== null;
    localStorage.removeItem(SAVE_KEY);
    return hadSave;
  } catch (e) {
    console.warn('Could not clear save:', e);
    return false;
  }
}