/**
 * CookieTap Game Engine
 * Pure calculation functions for game mechanics.
 * No side effects, no DOM access - just math and state transformations.
 */

import type {
  GameState,
  BuildingState,
  PrestigeUpgradeState,
  AchievementState,
  AchievementCheckState,
  PrestigeCalculation,
  PurchaseResult,
} from './schema';

import {
  BUILDINGS,
  PRESTIGE_UPGRADES,
  ACHIEVEMENTS,
  GARDEN_REWARDS,
  GARDEN_UNLOCK_THRESHOLD,
  GARDEN_INITIAL_SEEDS,
  GARDEN_PLOT_COUNT,
  COST_MULTIPLIER_BASE,
  COST_MULTIPLIER_DISCOUNTED,
  ACHIEVEMENT_CPS_MULTIPLIER,
  MILESTONE_CPS_MULTIPLIER,
  HEAVENLY_CHIP_CPS_BONUS,
  OFFLINE_MULTIPLIER_BASE,
  OFFLINE_MULTIPLIER_BOOSTED,
  PRESTIGE_DIVISOR,
} from './catalog';

// ============================================
// CPS & MULTIPLIER CALCULATIONS
// ============================================

/**
 * Calculate the cost for the next building purchase.
 * Uses the exponential cost formula: baseCost * multiplier^owned
 */
export function getBuildingCost(key: string, owned: number, hasDiscount: boolean): number {
  const building = BUILDINGS[key];
  if (!building) return Infinity;

  const multiplier = hasDiscount ? COST_MULTIPLIER_DISCOUNTED : COST_MULTIPLIER_BASE;
  return Math.floor(building.baseCost * Math.pow(multiplier, owned));
}

/**
 * Calculate the base CPS from buildings only (before multipliers).
 */
export function getBaseCps(buildings: Record<string, BuildingState>): number {
  let cps = 0;
  for (const key in buildings) {
    const building = BUILDINGS[key];
    if (building) {
      cps += buildings[key].owned * building.baseCps;
    }
  }
  return cps;
}

/**
 * Calculate total CPS with all multipliers applied.
 */
export function getTotalCps(state: Pick<GameState, 'buildings' | 'globalMultiplier'>): number {
  return getBaseCps(state.buildings) * state.globalMultiplier;
}

/**
 * Calculate the click power with multiplier.
 */
export function getClickPower(
  baseClickPower: number,
  clickMultiplier: number
): number {
  return baseClickPower * clickMultiplier;
}

/**
 * Calculate the CPS bonus from achievements.
 * Each unlocked achievement adds ACHIEVEMENT_CPS_MULTIPLIER to global multiplier.
 */
export function getAchievementMultiplier(
  achievements: Record<string, AchievementState>
): number {
  let multiplier = 1;
  for (const key in achievements) {
    if (achievements[key].unlocked) {
      multiplier *= ACHIEVEMENT_CPS_MULTIPLIER;
    }
  }
  return multiplier;
}

/**
 * Calculate the heavenly chip CPS bonus.
 * Only applies if the heavenlyLuck prestige upgrade is purchased.
 */
export function getHeavenlyChipBonus(
  heavenlyChips: number,
  hasHeavenlyLuck: boolean
): number {
  if (!hasHeavenlyLuck) return 0;
  return heavenlyChips * HEAVENLY_CHIP_CPS_BONUS;
}

// ============================================
// PRESTIGE CALCULATIONS
// ============================================

/**
 * Calculate total heavenly chips earned from all-time cookies.
 * Formula: floor(sqrt(totalCookiesAllTime / PRESTIGE_DIVISOR))
 */
export function calculateTotalHeavenlyChips(totalCookiesAllTime: number): number {
  return Math.floor(Math.sqrt(totalCookiesAllTime / PRESTIGE_DIVISOR));
}

/**
 * Calculate prestige information for the prestige UI.
 */
export function calculatePrestigeInfo(
  totalCookiesAllTime: number,
  currentHeavenlyChips: number
): PrestigeCalculation {
  const totalChips = calculateTotalHeavenlyChips(totalCookiesAllTime);
  const potentialGain = totalChips - currentHeavenlyChips;

  return {
    totalChips,
    currentChips: currentHeavenlyChips,
    potentialGain: Math.max(0, potentialGain),
  };
}

/**
 * Check if prestige is available (potential gain > 0).
 */
export function canPrestige(prestigeInfo: PrestigeCalculation): boolean {
  return prestigeInfo.potentialGain > 0;
}

// ============================================
// OFFLINE ACCRUAL
// ============================================

/**
 * Calculate offline cookies earned while away.
 * Uses the offlineMultiplier (default 50%, can be boosted to 100%).
 */
export function calculateOfflineCookies(
  cps: number,
  offlineSeconds: number,
  offlineMultiplier: number,
  hasOfflineBoost: boolean
): number {
  const effectiveMultiplier = hasOfflineBoost
    ? OFFLINE_MULTIPLIER_BOOSTED
    : offlineMultiplier;
  return cps * offlineSeconds * effectiveMultiplier;
}

/**
 * Check if offline progress should be shown (offline for more than 60 seconds with CPS > 0).
 */
export function shouldShowOfflineProgress(
  offlineSeconds: number,
  cps: number
): boolean {
  return offlineSeconds > 60 && cps > 0;
}

// ============================================
// PURCHASE ACTIONS (PURE)
// ============================================

/**
 * Attempt to purchase a building. Returns result without mutating state.
 */
export function attemptBuildingPurchase(
  cookies: number,
  key: string,
  owned: number,
  hasDiscount: boolean
): PurchaseResult {
  const cost = getBuildingCost(key, owned, hasDiscount);

  if (cookies >= cost) {
    return {
      success: true,
      newCookies: cookies - cost,
      newOwned: owned + 1,
      cost,
    };
  }

  return {
    success: false,
    newCookies: cookies,
    newOwned: owned,
    cost,
  };
}

/**
 * Attempt to purchase a prestige upgrade. Returns result without mutating state.
 */
export function attemptPrestigePurchase(
  heavenlyChips: number,
  key: string,
  purchased: boolean,
  cost: number
): PurchaseResult {
  if (purchased || heavenlyChips < cost) {
    return {
      success: false,
      newCookies: heavenlyChips,
      newOwned: purchased ? 1 : 0,
      cost,
    };
  }

  return {
    success: true,
    newCookies: heavenlyChips - cost,
    newOwned: 1,
    cost,
  };
}

// ============================================
// ACHIEVEMENT CHECKING
// ============================================

/**
 * Create the minimal state needed for achievement checks.
 */
export function createAchievementCheckState(state: GameState): AchievementCheckState {
  return {
    clicks: state.clicks,
    totalCookies: state.totalCookies,
    totalCookiesAllTime: state.totalCookiesAllTime,
    heavenlyChips: state.heavenlyChips,
    prestigeCount: state.prestigeCount,
    goldenCookiesClicked: state.goldenCookiesClicked,
    buildings: state.buildings,
  };
}

/**
 * Check which achievements should be unlocked.
 * Returns array of newly unlocked achievement keys.
 */
export function checkAchievements(
  checkState: AchievementCheckState,
  currentAchievements: Record<string, AchievementState>
): string[] {
  const newlyUnlocked: string[] = [];

  for (const key in ACHIEVEMENTS) {
    const achievementDef = ACHIEVEMENTS[key];
    const currentState = currentAchievements[key];

    if (!currentState.unlocked && achievementDef.condition(checkState)) {
      newlyUnlocked.push(key);
    }
  }

  return newlyUnlocked;
}

// ============================================
// MILESTONE CHECKING
// ============================================

import { MILESTONE_THRESHOLDS } from './schema';

/**
 * Check if buying this building count triggers a milestone.
 * Returns the milestone number or null if not a milestone.
 */
export function checkMilestone(newOwned: number): number | null {
  for (const threshold of MILESTONE_THRESHOLDS) {
    if (newOwned === threshold) {
      return threshold;
    }
  }
  return null;
}

/**
 * Apply milestone bonus to building CPS.
 * Doubles the baseCps for that building.
 */
export function applyMilestoneBonus(baseCps: number): number {
  return baseCps * MILESTONE_CPS_MULTIPLIER;
}

// ============================================
// GARDEN CALCULATIONS
// ============================================

/**
 * Check if garden should be unlocked.
 */
export function shouldUnlockGarden(cookies: number): boolean {
  return cookies >= GARDEN_UNLOCK_THRESHOLD;
}

/**
 * Calculate reward for harvesting a crop.
 */
export function getHarvestReward(crop: string): number {
  return GARDEN_REWARDS[crop] || 100;
}

/**
 * Create initial garden state.
 */
export function createInitialGarden(): {
  unlocked: boolean;
  plots: (string | null)[];
  seeds: number;
} {
  return {
    unlocked: false,
    plots: Array(GARDEN_PLOT_COUNT).fill(null),
    seeds: GARDEN_INITIAL_SEEDS,
  };
}

// ============================================
// NUMBER FORMATTING
// ============================================

/** Suffixes for number formatting */
const NUMBER_SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];

/**
 * Format a number with suffixes for display.
 * Examples: 1500 -> "1.50K", 1000000 -> "1.00M"
 */
export function formatNumber(num: number): string {
  if (num < 1000) return Math.floor(num).toString();

  const exp = Math.floor(Math.log10(num) / 3);
  const suffix = NUMBER_SUFFIXES[Math.min(exp, NUMBER_SUFFIXES.length - 1)];
  const divisor = Math.pow(1000, exp);

  return (num / divisor).toFixed(2) + suffix;
}

// ============================================
// INITIAL STATE FACTORY
// ============================================

/**
 * Create the default initial game state.
 */
export function createInitialGameState(): GameState {
  const buildings: Record<string, BuildingState> = {};
  for (const key in BUILDINGS) {
    buildings[key] = { owned: 0 };
  }

  const prestigeUpgrades: Record<string, PrestigeUpgradeState> = {};
  for (const key in PRESTIGE_UPGRADES) {
    prestigeUpgrades[key] = { purchased: false };
  }

  const achievements: Record<string, AchievementState> = {};
  for (const key in ACHIEVEMENTS) {
    achievements[key] = { unlocked: false };
  }

  const now = Date.now();

  return {
    cookies: 0,
    totalCookies: 0,
    totalCookiesAllTime: 0,
    clicks: 0,
    clickPower: 1,
    globalMultiplier: 1,
    clickMultiplier: 1,
    offlineMultiplier: OFFLINE_MULTIPLIER_BASE,
    heavenlyChips: 0,
    totalHeavenlyChips: 0,
    prestigeCount: 0,
    buildings,
    prestigeUpgrades,
    achievements,
    garden: createInitialGarden(),
    goldenCookiesClicked: 0,
    totalPlayTime: 0,
    settings: {
      soundEnabled: true,
      particlesEnabled: true,
      screenShakeEnabled: true,
      darkMode: false,
    },
    startTime: now,
    lastSave: now,
    lastGoldenCookie: 0,
  };
}

// ============================================
// PRESTIGE RESET
// ============================================

/**
 * Perform a prestige reset, keeping prestige-related state.
 */
export function performPrestige(state: GameState): GameState {
  const prestigeInfo = calculatePrestigeInfo(state.totalCookiesAllTime, state.heavenlyChips);
  const gain = prestigeInfo.potentialGain;

  if (gain <= 0) {
    return state; // No prestige available
  }

  const newHeavenlyChips = prestigeInfo.totalChips;
  const hasStarterPack = state.prestigeUpgrades.starterCookies?.purchased ?? false;
  const hasHeavenlyLuck = state.prestigeUpgrades.heavenlyLuck?.purchased ?? false;

  // Reset buildings
  const newBuildings: Record<string, BuildingState> = {};
  for (const key in BUILDINGS) {
    newBuildings[key] = { owned: 0 };
  }

  // Reset achievements
  const newAchievements: Record<string, AchievementState> = {};
  for (const key in ACHIEVEMENTS) {
    newAchievements[key] = { unlocked: false };
  }

  // Calculate new global multiplier from heavenly chips
  let newGlobalMultiplier = 1;
  if (hasHeavenlyLuck) {
    newGlobalMultiplier = 1 + newHeavenlyChips * HEAVENLY_CHIP_CPS_BONUS;
  }

  return {
    ...state,
    cookies: hasStarterPack ? 100 : 0,
    totalCookies: 0,
    clicks: 0,
    globalMultiplier: newGlobalMultiplier,
    clickMultiplier: 1,
    heavenlyChips: newHeavenlyChips,
    totalHeavenlyChips: state.totalHeavenlyChips + gain,
    prestigeCount: state.prestigeCount + 1,
    buildings: newBuildings,
    achievements: newAchievements,
    garden: createInitialGarden(),
    startTime: Date.now(),
  };
}