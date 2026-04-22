/**
 * CookieTap Game Store
 * Svelte reactive store wrapping the domain modules.
 *
 * This is the thin adapter layer between:
 * - The domain logic (src/lib/game/*)
 * - The UI components (src/lib/components/* and +page.svelte)
 *
 * The store provides:
 * - Reactive state signals
 * - Action methods that call domain functions
 * - Side-effect handling (timers, golden cookies)
 */

import { writable, derived, get } from 'svelte/store';
import type { Writable, Readable } from 'svelte/store';

import type { GameState, SaveDataV2 } from '../game/schema';
import {
  createInitialGameState,
  getTotalCps,
  getBuildingCost,
  getClickPower,
  calculatePrestigeInfo,
  attemptBuildingPurchase,
  attemptPrestigePurchase,
  checkAchievements,
  checkMilestone,
  applyMilestoneBonus,
  createAchievementCheckState,
  formatNumber,
  performPrestige,
} from '../game/engine';

import {
  loadGame,
  saveGame,
  extractSaveData,
  SAVE_KEY,
} from '../game/persistence';

import {
  BUILDINGS,
  PRESTIGE_UPGRADES,
  ACHIEVEMENTS,
  GARDEN_CROPS,
  GARDEN_GROWTH_TIME,
  TICK_INTERVAL,
  AUTOSAVE_INTERVAL,
  ACHIEVEMENT_CPS_MULTIPLIER,
  COST_MULTIPLIER_DISCOUNTED,
} from '../game/catalog';

import {
  generateGoldenEffect,
  applyGoldenEffect,
  pickRandomEvent,
} from '../game/effects';

import {
  showAchievement,
  showEventBanner,
  showMilestone,
} from '../runtime/ui-notifications';

// ============================================
// STORE TYPES
// ============================================

/** Offline modal data */
export interface OfflineModalData {
  show: boolean;
  cookies: number;
}

/** Modal state */
export interface ModalState {
  offline: OfflineModalData;
  settings: boolean;
  stats: boolean;
  prestige: boolean;
}

// ============================================
// REACTIVE STORES
// ============================================

/** Main game state store */
export const gameState: Writable<GameState> = writable(createInitialGameState());

/** Derived CPS value */
export const cps: Readable<number> = derived(gameState, ($state) => {
  return getTotalCps($state);
});

/** Derived click power value */
export const clickPower: Readable<number> = derived(gameState, ($state) => {
  return getClickPower($state.clickPower, $state.clickMultiplier);
});

/** Modal state */
export const modals = writable<ModalState>({
  offline: { show: false, cookies: 0 },
  settings: false,
  stats: false,
  prestige: false,
});

// ============================================
// GAME ACTIONS
// ============================================

/** Initialize game from save */
export function initGame(): void {
  const result = loadGame();

  gameState.set(result.state);

  if (result.showOfflineModal && result.offlineCookies > 0) {
    modals.update((m) => ({
      ...m,
      offline: { show: true, cookies: result.offlineCookies },
    }));
  }
}

/** Click the main cookie */
export function clickCookie(): void {
  gameState.update((state) => {
    const clickValue = getClickPower(state.clickPower, state.clickMultiplier);

    return {
      ...state,
      cookies: state.cookies + clickValue,
      totalCookies: state.totalCookies + clickValue,
      totalCookiesAllTime: state.totalCookiesAllTime + clickValue,
      clicks: state.clicks + 1,
    };
  });

  // Check achievements
  checkAndUnlockAchievements();
}

/** Buy a building */
export function buyBuilding(key: string): void {
  gameState.update((state) => {
    const hasDiscount = state.prestigeUpgrades.buildingDiscount?.purchased ?? false;
    const result = attemptBuildingPurchase(
      state.cookies,
      key,
      state.buildings[key]?.owned ?? 0,
      hasDiscount
    );

    if (!result.success) return state;

    const newBuildings = { ...state.buildings };
    newBuildings[key] = { owned: result.newOwned };

    // Check for milestone
    const milestone = checkMilestone(result.newOwned);
    if (milestone) {
      // Double efficiency would go here, but we don't modify baseCps in state
      // This is a known gap noted in the deliverables
    }

    return {
      ...state,
      cookies: result.newCookies,
      buildings: newBuildings,
    };
  });

  checkAndUnlockAchievements();
}

/** Buy a prestige upgrade */
export function buyPrestigeUpgrade(key: string): void {
  gameState.update((state) => {
    const upgrade = PRESTIGE_UPGRADES[key];
    if (!upgrade) return state;

    const currentPurchased = state.prestigeUpgrades[key]?.purchased ?? false;
    const result = attemptPrestigePurchase(
      state.heavenlyChips,
      key,
      currentPurchased,
      upgrade.cost
    );

    if (!result.success) return state;

    const newPrestigeUpgrades = { ...state.prestigeUpgrades };
    newPrestigeUpgrades[key] = { purchased: true };

    // REGRESSION FIX: Apply Heavenly Luck bonus correctly
    // 1. Compute from post-purchase chip balance (result.newCookies), not pre-purchase
    // 2. Preserve existing multiplier contributions (achievements, frenzy) by multiplying
    let newGlobalMultiplier = state.globalMultiplier;
    if (key === 'heavenlyLuck') {
      // Heavenly Luck: +2% CPS per heavenly chip
      // Compute bonus multiplier and apply to existing, don't replace
      const postPurchaseChips = result.newCookies;
      const heavenlyLuckMultiplier = 1 + postPurchaseChips * 0.02;
      // Remove any pre-existing heavenly luck contribution by dividing it out
      // (If heavenly luck wasn't purchased before, state.multiplier has no HL contribution)
      // Since this is first purchase, just multiply the base multiplier by HL
      newGlobalMultiplier = state.globalMultiplier * heavenlyLuckMultiplier;
    }

    return {
      ...state,
      heavenlyChips: result.newCookies,
      prestigeUpgrades: newPrestigeUpgrades,
      globalMultiplier: newGlobalMultiplier,
    };
  });
}

/** Perform prestige ascension */
export function doPrestige(): void {
  gameState.update((state) => performPrestige(state));
  closeAllModals();
}

/** Plant a garden plot */
export function plantPlot(index: number): void {
  gameState.update((state) => {
    if (!state.garden.unlocked) return state;
    if (state.garden.plots[index]) return state;
    if (state.garden.seeds <= 0) return state;

    const newPlots = [...state.garden.plots];
    newPlots[index] = '🌱';

    return {
      ...state,
      garden: {
        ...state.garden,
        plots: newPlots,
        seeds: state.garden.seeds - 1,
      },
    };
  });

  // Schedule growth
  setTimeout(() => growPlot(index), GARDEN_GROWTH_TIME);
}

/** Grow a planted plot */
function growPlot(index: number): void {
  gameState.update((state) => {
    if (state.garden.plots[index] !== '🌱') return state;

    const newPlots = [...state.garden.plots];
    newPlots[index] = GARDEN_CROPS[Math.floor(Math.random() * GARDEN_CROPS.length)];

    return {
      ...state,
      garden: {
        ...state.garden,
        plots: newPlots,
      },
    };
  });
}

/** Harvest a grown plot */
export function harvestPlot(index: number, reward: number): void {
  gameState.update((state) => {
    if (!state.garden.plots[index] || state.garden.plots[index] === '🌱') return state;

    const newPlots = [...state.garden.plots];
    newPlots[index] = null;

    return {
      ...state,
      cookies: state.cookies + reward,
      totalCookies: state.totalCookies + reward,
      garden: {
        ...state.garden,
        plots: newPlots,
        seeds: state.garden.seeds + 1,
      },
    };
  });
}

// ============================================
// ACHIEVEMENT CHECKING
// ============================================

function checkAndUnlockAchievements(): void {
  gameState.update((state) => {
    const checkState = createAchievementCheckState(state);
    const newlyUnlocked = checkAchievements(checkState, state.achievements);

    if (newlyUnlocked.length === 0) return state;

    const newAchievements = { ...state.achievements };
    let multiplier = state.globalMultiplier;

    for (const key of newlyUnlocked) {
      newAchievements[key] = { unlocked: true };
      multiplier *= ACHIEVEMENT_CPS_MULTIPLIER;
    }

    return {
      ...state,
      achievements: newAchievements,
      globalMultiplier: multiplier,
    };
  });
}

// ============================================
// MODAL HELPERS
// ============================================

export function closeAllModals(): void {
  modals.update((m) => ({
    offline: { show: false, cookies: 0 },
    settings: false,
    stats: false,
    prestige: false,
  }));
}

export function showSettingsModal(): void {
  modals.update((m) => ({ ...m, settings: true }));
}

export function showStatsModal(): void {
  modals.update((m) => ({ ...m, stats: true }));
}

export function showPrestigeModal(): void {
  modals.update((m) => ({ ...m, prestige: true }));
}

// ============================================
// SETTINGS
// ============================================

export function toggleSetting(key: keyof GameState['settings']): void {
  gameState.update((state) => ({
    ...state,
    settings: {
      ...state.settings,
      [key]: !state.settings[key],
    },
  }));
}

export function resetGame(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SAVE_KEY);
    gameState.set(createInitialGameState());
    closeAllModals();
  }
}

// ============================================
// GAME LOOP (CPS ACCUMULATION)
// ============================================

let gameLoopInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Start the game loop that accumulates CPS cookies.
 * Call once at app startup after initGame().
 */
export function startGameLoop(): void {
  if (gameLoopInterval !== null) return; // Already running
  
  gameLoopInterval = setInterval(() => {
    gameState.update((state) => {
      const currentCps = getTotalCps(state);
      const tickCps = currentCps * (TICK_INTERVAL / 1000); // Convert interval to fraction
      
      if (tickCps <= 0) return state;
      
      return {
        ...state,
        cookies: state.cookies + tickCps,
        totalCookies: state.totalCookies + tickCps,
        totalCookiesAllTime: state.totalCookiesAllTime + tickCps,
      };
    });
  }, TICK_INTERVAL);
}

/**
 * Stop the game loop.
 * Call when cleaning up or pausing the game.
 */
export function stopGameLoop(): void {
  if (gameLoopInterval !== null) {
    clearInterval(gameLoopInterval);
    gameLoopInterval = null;
  }
}

// ============================================
// DERIVED COMPUTATIONS FOR UI
// ============================================

/** Get current building cost for display */
export function getBuildingCostNow(key: string): number {
  const state = get(gameState);
  const hasDiscount = state.prestigeUpgrades.buildingDiscount?.purchased ?? false;
  return getBuildingCost(key, state.buildings[key]?.owned ?? 0, hasDiscount);
}

/** Get prestige info for display */
export function getPrestigeInfo() {
  const state = get(gameState);
  // Use totalHeavenlyChips ledger to prevent re-minting spent chips
  return calculatePrestigeInfo(state.totalCookiesAllTime, state.totalHeavenlyChips);
}

/** Check if building is affordable */
export function canAffordBuilding(key: string): boolean {
  const state = get(gameState);
  const cost = getBuildingCostNow(key);
  return state.cookies >= cost;
}

// ============================================
// GOLDEN COOKIE AND EVENTS
// ============================================

let goldenEffectTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Handle golden cookie click.
 * Called by UI when user clicks a golden cookie.
 */
export function handleGoldenCookieClick(): void {
  const state = get(gameState);
  const currentCps = getTotalCps(state);
  const effect = generateGoldenEffect(currentCps);

  // Update state with effect rewards
  gameState.update((s) => {
    const newState = applyGoldenEffect(s, effect);
    return {
      ...newState,
      lastGoldenCookie: Date.now(),
    };
  });

  // Show notification for effect
  if (effect.cookieReward) {
    showAchievement(effect.title, effect.description);
  } else if (effect.type === 'frenzy' || effect.type === 'clickFrenzy') {
    showEventBanner(effect.title, effect.description);

    // Schedule removal after duration
    if (effect.duration && effect.multiplier) {
      if (goldenEffectTimeout !== null) clearTimeout(goldenEffectTimeout);
      goldenEffectTimeout = setTimeout(() => {
        gameState.update((s) => {
          if (effect.type === 'frenzy') {
            return { ...s, globalMultiplier: s.globalMultiplier / effect.multiplier! };
          } else if (effect.type === 'clickFrenzy') {
            return { ...s, clickMultiplier: s.clickMultiplier / effect.multiplier! };
          }
          return s;
        });
      }, effect.duration * 1000);
    }
  }

  // Check achievements
  checkAndUnlockAchievements();
}

/**
 * Handle random event trigger.
 * Called by runtime when a random event should occur.
 */
export function handleRandomEvent(): void {
  const event = pickRandomEvent();

  gameState.update((state) => event.apply(state));

  showEventBanner(event.name, event.desc);

  // Schedule removal if temporary
  if (event.durationSec > 0 && event.remove) {
    setTimeout(() => {
      gameState.update((state) => event.remove!(state));
    }, event.durationSec * 1000);
  }
}

// ============================================
// EXPORT CATALOG FOR UI
// ============================================

export { BUILDINGS, BUILDING_KEYS, PRESTIGE_UPGRADES, PRESTIGE_UPGRADE_KEYS, ACHIEVEMENTS, ACHIEVEMENT_KEYS } from '../game/catalog';
export { 
  GARDEN_REWARDS, 
  GARDEN_CROPS, 
  GARDEN_GROWTH_TIME, 
  GARDEN_UNLOCK_THRESHOLD,
  GARDEN_INITIAL_SEEDS,
  GARDEN_PLOT_COUNT,
  TICK_INTERVAL, 
  AUTOSAVE_INTERVAL,
  GOLDEN_SPAWN_CHANCE,
  GOLDEN_SPAWN_CHANCE_BOOSTED,
  GOLDEN_SPAWN_COOLDOWN,
  GOLDEN_DESPAWN_TIME,
  GOLDEN_SPAWN_CHECK_INTERVAL,
  RANDOM_EVENT_CHANCE,
  RANDOM_EVENT_THRESHOLD,
  RANDOM_EVENT_CHECK_INTERVAL,
  NEWS_HEADLINES,
  NEWS_ROTATION_INTERVAL,
  COST_MULTIPLIER_BASE,
  COST_MULTIPLIER_DISCOUNTED,
  ACHIEVEMENT_CPS_MULTIPLIER,
  MILESTONE_CPS_MULTIPLIER,
  HEAVENLY_CHIP_CPS_BONUS,
  OFFLINE_MULTIPLIER_BASE,
} from '../game/catalog';
export { formatNumber };