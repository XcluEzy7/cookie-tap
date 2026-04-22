/**
 * CookieTap Domain Schema
 * Framework-agnostic type definitions and versioned save contract.
 *
 * These types describe the pure game state without any UI coupling.
 * All game logic modules (engine, persistence, effects) operate on these types.
 */

// ============================================
// VERSIONED SAVE CONTRACT
// ============================================

/** Current save schema version. Increment when making breaking changes. */
export const SAVE_VERSION = 2;

/** Version 1 (legacy) - the original `cookieClickerSave` localStorage format */
export interface LegacySaveData {
  cookies: number;
  totalCookies: number;
  clicks: number;
  clickPower: number;
  buildings: Record<string, { owned: number }>;
  lastSave: number;
}

/** Version 2 (current) - full feature save with prestige, achievements, garden, settings */
export interface SaveDataV2 {
  /** Schema version for migration detection */
  version: 2;

  // Core resources
  cookies: number;
  totalCookies: number;
  totalCookiesAllTime: number;
  clicks: number;
  clickPower: number;

  // Multipliers
  globalMultiplier: number;
  clickMultiplier: number;
  offlineMultiplier: number;

  // Prestige
  heavenlyChips: number;
  totalHeavenlyChips: number;
  prestigeCount: number;

  // Buildings (only `owned` is persisted; baseCost/baseCps come from catalog)
  buildings: Record<string, { owned: number }>;

  // Prestige upgrades (only `purchased` flag persisted)
  prestigeUpgrades: Record<string, { purchased: boolean }>;

  // Achievements (only `unlocked` flag persisted)
  achievements: Record<string, { unlocked: boolean }>;

  // Garden
  garden: {
    unlocked: boolean;
    plots: (string | null)[];
    seeds: number;
  };

  // Stats
  goldenCookiesClicked: number;
  totalPlayTime: number;

  // Settings
  settings: {
    soundEnabled: boolean;
    particlesEnabled: boolean;
    screenShakeEnabled: boolean;
    darkMode: boolean;
  };

  // Timing
  startTime: number;
  lastSave: number;
  lastGoldenCookie: number;
}

/** Union type for all known save versions */
export type AnySaveData = LegacySaveData | SaveDataV2;

// ============================================
// CORE GAME TYPES
// ============================================

/** Building definition (static catalog data) */
export interface BuildingDef {
  /** Unique key for the building */
  key: string;
  /** Display name */
  name: string;
  /** Emoji icon */
  icon: string;
  /** Base cost for first purchase */
  baseCost: number;
  /** Base cookies per second */
  baseCps: number;
}

/** Building runtime state (owned count only) */
export interface BuildingState {
  owned: number;
}

/** Prestige upgrade definition */
export interface PrestigeUpgradeDef {
  key: string;
  name: string;
  desc: string;
  cost: number;
  effect: PrestigeEffectType;
}

/** Prestige effect types */
export type PrestigeEffectType =
  | 'cps_bonus'
  | 'start_cookies'
  | 'offline_boost'
  | 'auto_click'
  | 'discount'
  | 'golden_boost';

/** Prestige upgrade runtime state */
export interface PrestigeUpgradeState {
  purchased: boolean;
}

/** Achievement definition */
export interface AchievementDef {
  key: string;
  name: string;
  desc: string;
  /** Condition function - takes current game state, returns true when unlocked */
  condition: AchievementCondition;
}

/** Achievement condition evaluator signature */
export type AchievementCondition = (state: AchievementCheckState) => boolean;

/** Minimal state needed for achievement condition checks */
export interface AchievementCheckState {
  clicks: number;
  totalCookies: number;
  totalCookiesAllTime: number;
  heavenlyChips: number;
  prestigeCount: number;
  goldenCookiesClicked: number;
  buildings: Record<string, { owned: number }>;
}

/** Achievement runtime state */
export interface AchievementState {
  unlocked: boolean;
}

// ============================================
// GAME ENGINE STATE
// ============================================

/** Full runtime game state (combines catalog + persisted state) */
export interface GameState {
  // Resources
  cookies: number;
  totalCookies: number;
  totalCookiesAllTime: number;
  clicks: number;
  clickPower: number;

  // Multipliers (modified by golden cookies, events, prestige)
  globalMultiplier: number;
  clickMultiplier: number;
  offlineMultiplier: number;

  // Prestige
  heavenlyChips: number;
  totalHeavenlyChips: number;
  prestigeCount: number;

  // Buildings (references catalog for definitions)
  buildings: Record<string, BuildingState>;

  // Prestige upgrades (references catalog for definitions)
  prestigeUpgrades: Record<string, PrestigeUpgradeState>;

  // Achievements (references catalog for definitions)
  achievements: Record<string, AchievementState>;

  // Garden
  garden: GardenState;

  // Stats
  goldenCookiesClicked: number;
  totalPlayTime: number;

  // Settings
  settings: GameSettings;

  // Timing
  startTime: number;
  lastSave: number;
  lastGoldenCookie: number;
}

/** Garden state */
export interface GardenState {
  unlocked: boolean;
  plots: (string | null)[];
  seeds: number;
}

/** User preferences (not gameplay-affecting) */
export interface GameSettings {
  soundEnabled: boolean;
  particlesEnabled: boolean;
  screenShakeEnabled: boolean;
  darkMode: boolean;
}

// ============================================
// EVENT TYPES
// ============================================

/** Golden cookie effect types */
export type GoldenEffectType = 'lucky' | 'frenzy' | 'clickFrenzy' | 'chain';

/** Golden cookie effect result */
export interface GoldenEffect {
  type: GoldenEffectType;
  title: string;
  description: string;
  /** Cookie reward (for lucky/chain) */
  cookieReward?: number;
  /** Multiplier applied (for frenzy/clickFrenzy) */
  multiplier?: number;
  /** Duration in milliseconds */
  duration?: number;
}

/** Random event types */
export type RandomEventType = 'marketCrash' | 'sugarRush' | 'grandmaUprising';

/** Random event definition */
export interface RandomEventDef {
  type: RandomEventType;
  name: string;
  desc: string;
  duration: number;
  effect: (state: GameState) => void;
  end?: (state: GameState) => void;
}

// ============================================
// MILESTONE TYPES
// ============================================

/** Building ownership milestone thresholds */
export const MILESTONE_THRESHOLDS = [100, 500, 1000, 2000] as const;

/** Check if owned count is a milestone */
export function isMilestone(owned: number): boolean {
  return MILESTONE_THRESHOLDS.includes(owned as typeof MILESTONE_THRESHOLDS[number]);
}

// ============================================
// UTILITY TYPES
// ============================================

/** Result of a purchase attempt */
export interface PurchaseResult {
  success: boolean;
  newCookies: number;
  newOwned: number;
  cost: number;
}

/** Result of prestige calculation */
export interface PrestigeCalculation {
  totalChips: number;
  currentChips: number;
  potentialGain: number;
}