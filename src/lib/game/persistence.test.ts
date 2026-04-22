/**
 * Characterization tests for CookieTap persistence and migration.
 * These tests verify the save/load behavior and legacy migration path.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  isLegacySave,
  isCurrentSave,
  migrateLegacySave,
  parseSaveData,
  mergeSaveWithCatalog,
  extractSaveData,
  saveGame,
  clearSave,
  type LoadResult,
} from './persistence';

import { createInitialGameState, formatNumber } from './engine';
import { SAVE_VERSION } from './schema';
import { BUILDINGS } from './catalog';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('Legacy Save Detection', () => {
  it('should identify legacy v1 saves (no version field)', () => {
    const legacyData = {
      cookies: 1000,
      totalCookies: 5000,
      clicks: 100,
      clickPower: 1,
      buildings: { cursor: { owned: 5 } },
      lastSave: Date.now(),
    };

    expect(isLegacySave(legacyData as any)).toBe(true);
    expect(isCurrentSave(legacyData as any)).toBe(false);
  });

  it('should identify current v2 saves', () => {
    const currentData = {
      version: 2,
      cookies: 1000,
      totalCookies: 5000,
    } as any;

    expect(isLegacySave(currentData)).toBe(false);
    expect(isCurrentSave(currentData)).toBe(true);
  });
});

describe('Legacy Migration', () => {
  it('should migrate legacy save to v2 format', () => {
    const legacy = {
      cookies: 10000,
      totalCookies: 50000,
      clicks: 500,
      clickPower: 5,
      buildings: {
        cursor: { owned: 25 },
        grandma: { owned: 10 },
      },
      lastSave: 1234567890000,
    };

    const migrated = migrateLegacySave(legacy);

    // Version should be set
    expect(migrated.version).toBe(SAVE_VERSION);

    // Core stats should transfer
    expect(migrated.cookies).toBe(10000);
    expect(migrated.totalCookies).toBe(50000);
    expect(migrated.clicks).toBe(500);
    expect(migrated.clickPower).toBe(5);

    // Buildings should merge with catalog
    expect(migrated.buildings.cursor.owned).toBe(25);
    expect(migrated.buildings.grandma.owned).toBe(10);
    expect(migrated.buildings.farm.owned).toBe(0); // Default

    // Prestige defaults (not in legacy)
    expect(migrated.heavenlyChips).toBe(0);
    expect(migrated.prestigeCount).toBe(0);

    // Settings defaults
    expect(migrated.settings.soundEnabled).toBe(true);
    expect(migrated.settings.darkMode).toBe(false);
  });

  it('should handle missing fields in legacy save', () => {
    const minimal = {
      cookies: 100,
    };

    const migrated = migrateLegacySave(minimal as any);

    expect(migrated.version).toBe(SAVE_VERSION);
    expect(migrated.cookies).toBe(100);
    expect(migrated.totalCookies).toBe(0);
    expect(migrated.clicks).toBe(0);
    expect(migrated.clickPower).toBe(1);
  });

  it('should preserve lastSave timestamp', () => {
    const timestamp = 1234567890000;
    const legacy = {
      lastSave: timestamp,
    };

    const migrated = migrateLegacySave(legacy as any);

    expect(migrated.lastSave).toBe(timestamp);
  });
});

describe('Parse Save Data', () => {
  it('should parse valid JSON', () => {
    const json = JSON.stringify({
      version: 2,
      cookies: 1000,
    });

    const data = parseSaveData(json);
    expect(data).not.toBeNull();
    expect((data as any)?.version).toBe(2);
    expect((data as any)?.cookies).toBe(1000);
  });

  it('should return null for invalid JSON', () => {
    const invalid = parseSaveData('not valid json');
    expect(invalid).toBeNull();
  });
});

describe('Merge Save With Catalog', () => {
  it('should fill missing buildings from catalog', () => {
    const save = {
      version: 2,
      cookies: 1000,
      buildings: {
        cursor: { owned: 50 },
      },
    } as any;

    const state = mergeSaveWithCatalog(save);

    // Saved building
    expect(state.buildings.cursor.owned).toBe(50);

    // All buildings from catalog should exist
    for (const key in BUILDINGS) {
      expect(state.buildings[key]).toBeDefined();
      if (key !== 'cursor') {
        expect(state.buildings[key].owned).toBe(0);
      }
    }
  });

  it('should apply defaults for missing settings', () => {
    const save = {
      version: 2,
      cookies: 1000,
    } as any;

    const state = mergeSaveWithCatalog(save);

    expect(state.settings.soundEnabled).toBe(true);
    expect(state.settings.particlesEnabled).toBe(true);
    expect(state.settings.screenShakeEnabled).toBe(true);
    expect(state.settings.darkMode).toBe(false);
  });

  it('should preserve existing settings', () => {
    const save = {
      version: 2,
      cookies: 1000,
      settings: {
        soundEnabled: false,
        darkMode: true,
      },
    } as any;

    const state = mergeSaveWithCatalog(save);

    expect(state.settings.soundEnabled).toBe(false);
    expect(state.settings.darkMode).toBe(true);
  });
});

describe('Extract and Round-Trip', () => {
  it('should extract save data from state', () => {
    const state = createInitialGameState();
    state.cookies = 5000;
    state.buildings.cursor.owned = 10;
    state.prestigeUpgrades.heavenlyLuck.purchased = true;
    state.achievements.firstClick.unlocked = true;

    const save = extractSaveData(state);

    expect(save.version).toBe(SAVE_VERSION);
    expect(save.cookies).toBe(5000);
    expect(save.buildings.cursor.owned).toBe(10);
    expect(save.prestigeUpgrades.heavenlyLuck.purchased).toBe(true);
    expect(save.achievements.firstClick.unlocked).toBe(true);
  });

  it('should round-trip without data loss', () => {
    const original = createInitialGameState();
    original.cookies = 12345;
    original.totalCookies = 50000;
    original.totalCookiesAllTime = 100000;
    original.clicks = 1000;
    original.clickPower = 10;
    original.globalMultiplier = 1.5;
    original.heavenlyChips = 5;
    original.buildings.cursor.owned = 100;
    original.buildings.grandma.owned = 50;
    original.prestigeUpgrades.heavenlyLuck.purchased = true;
    original.achievements.firstClick.unlocked = true;
    original.achievements.clickNovice.unlocked = true;
    original.garden.unlocked = true;
    original.garden.seeds = 10;
    original.settings.darkMode = true;
    original.settings.soundEnabled = false;

    const save = extractSaveData(original);
    const restored = mergeSaveWithCatalog(save);

    expect(restored.cookies).toBe(original.cookies);
    expect(restored.totalCookies).toBe(original.totalCookies);
    expect(restored.totalCookiesAllTime).toBe(original.totalCookiesAllTime);
    expect(restored.clicks).toBe(original.clicks);
    expect(restored.clickPower).toBe(original.clickPower);
    expect(restored.globalMultiplier).toBe(original.globalMultiplier);
    expect(restored.heavenlyChips).toBe(original.heavenlyChips);
    expect(restored.buildings.cursor.owned).toBe(original.buildings.cursor.owned);
    expect(restored.buildings.grandma.owned).toBe(original.buildings.grandma.owned);
    expect(restored.prestigeUpgrades.heavenlyLuck.purchased).toBe(true);
    expect(restored.achievements.firstClick.unlocked).toBe(true);
    expect(restored.garden.unlocked).toBe(true);
    expect(restored.settings.darkMode).toBe(true);
    expect(restored.settings.soundEnabled).toBe(false);
  });
});

describe('localStorage Operations', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  it('should save to localStorage', () => {
    const state = createInitialGameState();
    state.cookies = 9999;

    const result = saveGame(state);
    expect(result).toBe(true);

    const saved = localStorageMock.getItem('cookieClickerSave');
    expect(saved).not.toBeNull();

    const parsed = JSON.parse(saved!);
    expect(parsed.cookies).toBe(9999);
  });

  it('should clear save data', () => {
    localStorageMock.setItem('cookieClickerSave', 'test data');

    const result = clearSave();
    expect(result).toBe(true);

    const cleared = localStorageMock.getItem('cookieClickerSave');
    expect(cleared).toBeNull();
  });
});