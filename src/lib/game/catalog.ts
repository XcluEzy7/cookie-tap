/**
 * CookieTap Game Catalog
 * Static definitions for buildings, prestige upgrades, and achievements.
 *
 * This module contains ONLY the static catalog data - no runtime state.
 * Game logic modules import from here for definitions.
 */

import type {
  BuildingDef,
  PrestigeUpgradeDef,
  AchievementDef,
  AchievementCheckState,
} from './schema';

// ============================================
// BUILDINGS CATALOG
// ============================================

/** All building definitions, keyed by their unique key */
export const BUILDINGS: Record<string, BuildingDef> = {
  cursor: {
    key: 'cursor',
    name: 'Cursor',
    icon: '🖱️',
    baseCost: 15,
    baseCps: 0.1,
  },
  grandma: {
    key: 'grandma',
    name: 'Grandma',
    icon: '👵',
    baseCost: 100,
    baseCps: 1,
  },
  farm: {
    key: 'farm',
    name: 'Farm',
    icon: '🚜',
    baseCost: 1100,
    baseCps: 8,
  },
  mine: {
    key: 'mine',
    name: 'Mine',
    icon: '⛏️',
    baseCost: 12000,
    baseCps: 47,
  },
  factory: {
    key: 'factory',
    name: 'Factory',
    icon: '🏭',
    baseCost: 130000,
    baseCps: 260,
  },
  bank: {
    key: 'bank',
    name: 'Bank',
    icon: '🏦',
    baseCost: 1400000,
    baseCps: 1400,
  },
  temple: {
    key: 'temple',
    name: 'Temple',
    icon: '🏛️',
    baseCost: 20000000,
    baseCps: 7800,
  },
  wizard: {
    key: 'wizard',
    name: 'Wizard Tower',
    icon: '🧙',
    baseCost: 330000000,
    baseCps: 44000,
  },
};

/** Get all building keys in order */
export const BUILDING_KEYS = Object.keys(BUILDINGS);

// ============================================
// PRESTIGE UPGRADES CATALOG
// ============================================

/** All prestige upgrade definitions */
export const PRESTIGE_UPGRADES: Record<string, PrestigeUpgradeDef> = {
  heavenlyLuck: {
    key: 'heavenlyLuck',
    name: 'Heavenly Luck',
    desc: '+2% CPS per Heavenly Chip',
    cost: 1,
    effect: 'cps_bonus',
  },
  starterCookies: {
    key: 'starterCookies',
    name: 'Starter Pack',
    desc: 'Start with +100 cookies after reset',
    cost: 5,
    effect: 'start_cookies',
  },
  offlineProduction: {
    key: 'offlineProduction',
    name: 'Time Warper',
    desc: 'Offline production up to 100%',
    cost: 10,
    effect: 'offline_boost',
  },
  autoClicker: {
    key: 'autoClicker',
    name: 'Auto Clicker',
    desc: 'Automatically clicks once per second',
    cost: 25,
    effect: 'auto_click',
  },
  buildingDiscount: {
    key: 'buildingDiscount',
    name: 'Divine Discount',
    desc: 'Buildings cost 10% less',
    cost: 50,
    effect: 'discount',
  },
  goldenFrequenter: {
    key: 'goldenFrequenter',
    name: 'Golden Touch',
    desc: 'Golden cookies appear 2x more often',
    cost: 100,
    effect: 'golden_boost',
  },
};

/** Get all prestige upgrade keys */
export const PRESTIGE_UPGRADE_KEYS = Object.keys(PRESTIGE_UPGRADES);

// ============================================
// ACHIEVEMENTS CATALOG
// ============================================

/** Click-related achievement conditions */
function clickCondition(threshold: number): (s: AchievementCheckState) => boolean {
  return (s: AchievementCheckState) => s.clicks >= threshold;
}

/** Total cookies baked achievement conditions */
function cookieCondition(threshold: number): (s: AchievementCheckState) => boolean {
  return (s: AchievementCheckState) => s.totalCookies >= threshold;
}

/** Building ownership achievement conditions */
function buildingCondition(key: string, threshold: number): (s: AchievementCheckState) => boolean {
  return (s: AchievementCheckState) => s.buildings[key]?.owned >= threshold;
}

/** All achievement definitions */
export const ACHIEVEMENTS: Record<string, AchievementDef> = {
  // Click achievements
  firstClick: {
    key: 'firstClick',
    name: 'First Steps',
    desc: 'Click your first cookie',
    condition: clickCondition(1),
  },
  clickNovice: {
    key: 'clickNovice',
    name: 'Click Apprentice',
    desc: 'Click 100 times',
    condition: clickCondition(100),
  },
  clickMaster: {
    key: 'clickMaster',
    name: 'Click Master',
    desc: 'Click 1,000 times',
    condition: clickCondition(1000),
  },
  clickLegend: {
    key: 'clickLegend',
    name: 'Click Legend',
    desc: 'Click 10,000 times',
    condition: clickCondition(10000),
  },

  // Cookie achievements
  firstHundred: {
    key: 'firstHundred',
    name: 'Baker',
    desc: 'Bake 100 cookies',
    condition: cookieCondition(100),
  },
  firstThousand: {
    key: 'firstThousand',
    name: 'Pastry Chef',
    desc: 'Bake 1,000 cookies',
    condition: cookieCondition(1000),
  },
  firstMillion: {
    key: 'firstMillion',
    name: 'Cookie Magnate',
    desc: 'Bake 1 million cookies',
    condition: cookieCondition(1000000),
  },
  firstBillion: {
    key: 'firstBillion',
    name: 'Cookie Tycoon',
    desc: 'Bake 1 billion cookies',
    condition: cookieCondition(1000000000),
  },
  firstTrillion: {
    key: 'firstTrillion',
    name: 'Cookie Emperor',
    desc: 'Bake 1 trillion cookies',
    condition: cookieCondition(1000000000000),
  },

  // Building achievements
  cursorCollector: {
    key: 'cursorCollector',
    name: 'Cursor Collector',
    desc: 'Own 10 cursors',
    condition: buildingCondition('cursor', 10),
  },
  grandmaGatherer: {
    key: 'grandmaGatherer',
    name: 'Grandma Gatherer',
    desc: 'Own 10 grandmas',
    condition: buildingCondition('grandma', 10),
  },
  farmFarmer: {
    key: 'farmFarmer',
    name: 'Farm Farmer',
    desc: 'Own 10 farms',
    condition: buildingCondition('farm', 10),
  },
  mineMiner: {
    key: 'mineMiner',
    name: 'Mine Miner',
    desc: 'Own 10 mines',
    condition: buildingCondition('mine', 10),
  },

  // Special achievements
  goldenClicker: {
    key: 'goldenClicker',
    name: 'Golden Clicker',
    desc: 'Click 10 golden cookies',
    condition: (s: AchievementCheckState) => s.goldenCookiesClicked >= 10,
  },
  firstPrestige: {
    key: 'firstPrestige',
    name: 'Ascended',
    desc: 'Prestige for the first time',
    condition: (s: AchievementCheckState) => s.prestigeCount >= 1,
  },
};

/** Get all achievement keys */
export const ACHIEVEMENT_KEYS = Object.keys(ACHIEVEMENTS);

// ============================================
// GARDEN CATALOG
// ============================================

/** Garden plot rewards by crop emoji */
export const GARDEN_REWARDS: Record<string, number> = {
  '🍪': 100,
  '🍩': 500,
  '🥠': 1000,
  '⭐': 5000,
};

/** Garden crop options for growth */
export const GARDEN_CROPS = ['🍪', '🍩', '🥠', '🍪', '⭐'];

/** Garden growth time in milliseconds */
export const GARDEN_GROWTH_TIME = 30000;

/** Garden unlock cookie threshold */
export const GARDEN_UNLOCK_THRESHOLD = 1000;

/** Garden initial seed count */
export const GARDEN_INITIAL_SEEDS = 3;

/** Garden total plots */
export const GARDEN_PLOT_COUNT = 12;

// ============================================
// NEWS HEADLINES
// ============================================

/** News ticker headlines (for UI) */
export const NEWS_HEADLINES = [
  "News: Local cookie factories hiring!",
  "News: Scientists discover cookies may contain trace amounts of happiness.",
  "News: Grandma arrested for cookie-related conspiracy.",
  "News: Cookie market reaches all-time high!",
  "News: 'I'm just here for the cookies' says anonymous clicker.",
  "News: World cookie reserves mysteriously depleting.",
  "News: Cookie-themed amusement park opening soon!",
  "News: Study shows clicking cookies reduces stress by 100%.",
  "News: International Cookie Day declared a global holiday.",
  "News: Cookies found to be the secret to eternal happiness.",
  "News: Cookie mine collapse! Dozens of chocolate chips lost.",
  "News: Cookie factory workers demand more dough.",
  "News: World leaders gather for emergency cookie summit.",
  "News: Cookie-based cryptocurrency 'DoughCoin' launches!",
  "News: Scientists working on infinite cookie theorem.",
  "News: Cookie-powered cars could end fossil fuel dependency.",
  "News: Fortune cookies now contain actual fortunes!",
  "News: Cookie-themed TV show 'Breaking Dough' tops ratings.",
  "News: Ancient cookie recipe discovered in pyramid!",
  "News: Cookie-related puns reach critical mass.",
];

// ============================================
// GAME CONSTANTS
// ============================================

/** Game tick interval in milliseconds */
export const TICK_INTERVAL = 100;

/** Auto-save interval in milliseconds */
export const AUTOSAVE_INTERVAL = 5000;

/** Golden cookie base spawn chance (per check) */
export const GOLDEN_SPAWN_CHANCE = 0.25;

/** Golden cookie enhanced spawn chance with upgrade */
export const GOLDEN_SPAWN_CHANCE_BOOSTED = 0.5;

/** Golden cookie minimum time between spawns in milliseconds */
export const GOLDEN_SPAWN_COOLDOWN = 120000;

/** Golden cookie despawn time in milliseconds */
export const GOLDEN_DESPAWN_TIME = 13000;

/** Golden cookie spawn check interval in milliseconds */
export const GOLDEN_SPAWN_CHECK_INTERVAL = 5000;

/** Random event chance (per check) */
export const RANDOM_EVENT_CHANCE = 0.3;

/** Random event minimum total cookies threshold */
export const RANDOM_EVENT_THRESHOLD = 1000;

/** Random event check interval in milliseconds */
export const RANDOM_EVENT_CHECK_INTERVAL = 60000;

/** News ticker rotation interval in milliseconds */
export const NEWS_ROTATION_INTERVAL = 15000;

/** Building cost multiplier base */
export const COST_MULTIPLIER_BASE = 1.15;

/** Building cost multiplier with discount upgrade */
export const COST_MULTIPLIER_DISCOUNTED = 1.135;

/** Achievement CPS bonus per unlock */
export const ACHIEVEMENT_CPS_MULTIPLIER = 1.01;

/** Milestone CPS multiplier (doubles efficiency) */
export const MILESTONE_CPS_MULTIPLIER = 2;

/** Heavenly chips CPS bonus per chip (as multiplier) */
export const HEAVENLY_CHIP_CPS_BONUS = 0.02;

/** Offline production base multiplier */
export const OFFLINE_MULTIPLIER_BASE = 0.5;

/** Offline production boosted multiplier */
export const OFFLINE_MULTIPLIER_BOOSTED = 1.0;

/** Click frenzy multiplier */
export const CLICK_FRENZY_MULTIPLIER = 777;

/** Click frenzy duration in milliseconds */
export const CLICK_FRENZY_DURATION = 13000;

/** CPS frenzy multiplier */
export const CPS_FRENZY_MULTIPLIER = 7;

/** CPS frenzy duration in milliseconds */
export const CPS_FRENZY_DURATION = 77000;

/** Lucky formula: CPS * 7 + 13 */
export const LUCKY_CPS_MULTIPLIER = 7;
export const LUCKY_BASE_COOKIES = 13;

/** Chain bonus: CPS * 10 */
export const CHAIN_CPS_MULTIPLIER = 10;

/** Prestige heavenly chips formula divisor */
export const PRESTIGE_DIVISOR = 1e12;