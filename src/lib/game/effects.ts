/**
 * CookieTap Effects Module
 * Golden cookie effects and random event definitions.
 *
 * These are pure functions that calculate effect results.
 * The actual application of effects (timers, UI) is handled by the game loop.
 */

import type { GameState, GoldenEffect, GoldenEffectType } from './schema';

import {
  LUCKY_CPS_MULTIPLIER,
  LUCKY_BASE_COOKIES,
  CHAIN_CPS_MULTIPLIER,
  CLICK_FRENZY_MULTIPLIER,
  CLICK_FRENZY_DURATION,
  CPS_FRENZY_MULTIPLIER,
  CPS_FRENZY_DURATION,
} from './catalog';

import { getTotalCps } from './engine';

// ============================================
// GOLDEN COOKIE EFFECTS
// ============================================

/**
 * Calculate the lucky reward: CPS * 7 + 13
 */
export function calculateLuckyReward(cps: number): number {
  return Math.floor(cps * LUCKY_CPS_MULTIPLIER + LUCKY_BASE_COOKIES);
}

/**
 * Calculate the chain reward: CPS * 10
 */
export function calculateChainReward(cps: number): number {
  return Math.floor(cps * CHAIN_CPS_MULTIPLIER);
}

/**
 * Generate a golden cookie effect.
 * Returns the effect details and any cookie reward.
 */
export function generateGoldenEffect(cps: number): GoldenEffect {
  const effects: GoldenEffectType[] = ['lucky', 'frenzy', 'clickFrenzy', 'chain'];
  const type = effects[Math.floor(Math.random() * effects.length)];

  switch (type) {
    case 'lucky':
      return {
        type: 'lucky',
        title: 'Lucky!',
        description: `+${formatNumber(calculateLuckyReward(cps))} cookies!`,
        cookieReward: calculateLuckyReward(cps),
      };

    case 'frenzy':
      return {
        type: 'frenzy',
        title: 'Frenzy!',
        description: 'x7 CPS for 77 seconds!',
        multiplier: CPS_FRENZY_MULTIPLIER,
        duration: CPS_FRENZY_DURATION,
      };

    case 'clickFrenzy':
      return {
        type: 'clickFrenzy',
        title: 'Click Frenzy!',
        description: '+777% click power for 13 seconds!',
        multiplier: CLICK_FRENZY_MULTIPLIER,
        duration: CLICK_FRENZY_DURATION,
      };

    case 'chain':
      return {
        type: 'chain',
        title: 'Cookie Chain!',
        description: 'Another golden cookie will appear soon!',
        cookieReward: calculateChainReward(cps),
      };

    default:
      // Fallback (should never hit)
      return {
        type: 'lucky',
        title: 'Lucky!',
        description: `+${formatNumber(calculateLuckyReward(cps))} cookies!`,
        cookieReward: calculateLuckyReward(cps),
      };
  }
}

/**
 * Apply a golden effect to game state.
 * Returns new state (does not mutate).
 */
export function applyGoldenEffect(
  state: GameState,
  effect: GoldenEffect
): GameState {
  let newState = { ...state };

  // Apply cookie rewards
  if (effect.cookieReward) {
    newState.cookies += effect.cookieReward;
    newState.totalCookies += effect.cookieReward;
    newState.totalCookiesAllTime += effect.cookieReward;
  }

  // Apply multipliers (UI/loop handles timing)
  if (effect.type === 'frenzy' && effect.multiplier) {
    newState.globalMultiplier = state.globalMultiplier * effect.multiplier;
  }

  if (effect.type === 'clickFrenzy' && effect.multiplier) {
    newState.clickMultiplier = state.clickMultiplier * effect.multiplier;
  }

  // Increment golden cookies clicked
  newState.goldenCookiesClicked++;

  return newState;
}

/**
 * Remove a frenzy effect (after duration expires).
 */
export function removeFrenzyEffect(
  state: GameState,
  multiplier: number
): GameState {
  return {
    ...state,
    globalMultiplier: state.globalMultiplier / multiplier,
  };
}

/**
 * Remove a click frenzy effect (after duration expires).
 */
export function removeClickFrenzyEffect(
  state: GameState,
  multiplier: number
): GameState {
  return {
    ...state,
    clickMultiplier: state.clickMultiplier / multiplier,
  };
}

// ============================================
// RANDOM EVENTS
// ============================================

export type RandomEvent = {
  type: string;
  name: string;
  desc: string;
  durationSec: number;
  /** Apply the effect to state */
  apply: (state: GameState) => GameState;
  /** Remove the effect after duration */
  remove?: (state: GameState) => GameState;
};

/**
 * Get all available random events.
 */
export function getRandomEvents(): RandomEvent[] {
  return [
    {
      type: 'marketCrash',
      name: 'Cookie Market Crash',
      desc: 'Buildings 10% cheaper for 60 seconds!',
      durationSec: 60,
      apply: (state: GameState) => ({
        ...state,
        globalMultiplier: state.globalMultiplier * 1.1,
      }),
      remove: (state: GameState) => ({
        ...state,
        globalMultiplier: state.globalMultiplier / 1.1,
      }),
    },
    {
      type: 'sugarRush',
      name: 'Sugar Rush',
      desc: '+50% CPS for 30 seconds!',
      durationSec: 30,
      apply: (state: GameState) => ({
        ...state,
        globalMultiplier: state.globalMultiplier * 1.5,
      }),
      remove: (state: GameState) => ({
        ...state,
        globalMultiplier: state.globalMultiplier / 1.5,
      }),
    },
    {
      type: 'grandmaUprising',
      name: 'Grandma Uprising',
      desc: '-1% cookies but +10% grandma CPS!',
      durationSec: 0, // Permanent effect
      apply: (state: GameState) => {
        // Note: This modifies building baseCps which isn't in GameState
        // For now we just apply the cookie penalty
        return {
          ...state,
          cookies: Math.floor(state.cookies * 0.99),
          totalCookies: Math.floor(state.totalCookies * 0.99),
        };
      },
    },
  ];
}

/**
 * Pick a random event from available events.
 */
export function pickRandomEvent(): RandomEvent {
  const events = getRandomEvents();
  return events[Math.floor(Math.random() * events.length)];
}

// ============================================
// SPAWN CHECKS
// ============================================

import {
  GOLDEN_SPAWN_CHANCE,
  GOLDEN_SPAWN_CHANCE_BOOSTED,
  GOLDEN_SPAWN_COOLDOWN,
  RANDOM_EVENT_CHANCE,
  RANDOM_EVENT_THRESHOLD,
} from './catalog';

/**
 * Check if a golden cookie should spawn.
 */
export function shouldSpawnGoldenCookie(
  lastSpawnTime: number,
  hasGoldenFrequenter: boolean
): boolean {
  const now = Date.now();
  if (now - lastSpawnTime < GOLDEN_SPAWN_COOLDOWN) {
    return false;
  }

  const chance = hasGoldenFrequenter ? GOLDEN_SPAWN_CHANCE_BOOSTED : GOLDEN_SPAWN_CHANCE;
  return Math.random() < chance;
}

/**
 * Check if a random event should trigger.
 */
export function shouldTriggerRandomEvent(totalCookies: number): boolean {
  if (totalCookies < RANDOM_EVENT_THRESHOLD) {
    return false;
  }
  return Math.random() < RANDOM_EVENT_CHANCE;
}

// ============================================
// UTILITY
// ============================================

import { formatNumber } from './engine';

export { formatNumber };