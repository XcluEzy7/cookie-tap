/**
 * Characterization tests for CookieTap game engine calculations.
 * These tests verify the core math formulas match the expected behavior.
 */

import { describe, it, expect } from 'vitest';
import {
  getBuildingCost,
  getBaseCps,
  getTotalCps,
  calculateTotalHeavenlyChips,
  calculatePrestigeInfo,
  calculateOfflineCookies,
  attemptBuildingPurchase,
  checkMilestone,
  formatNumber,
  createInitialGameState,
  performPrestige,
} from './engine';

import { BUILDINGS, COST_MULTIPLIER_BASE, COST_MULTIPLIER_DISCOUNTED } from './catalog';

describe('Building Cost Calculation', () => {
  it('should calculate first building cost as base cost', () => {
    const cursorCost = getBuildingCost('cursor', 0, false);
    expect(cursorCost).toBe(15);

    const grandmaCost = getBuildingCost('grandma', 0, false);
    expect(grandmaCost).toBe(100);

    const farmCost = getBuildingCost('farm', 0, false);
    expect(farmCost).toBe(1100);
  });

  it('should use exponential cost formula', () => {
    // Formula: baseCost * 1.15^owned
    const cursorSecondCost = getBuildingCost('cursor', 1, false);
    expect(cursorSecondCost).toBe(Math.floor(15 * Math.pow(1.15, 1)));

    const cursorTenthCost = getBuildingCost('cursor', 10, false);
    expect(cursorTenthCost).toBe(Math.floor(15 * Math.pow(1.15, 10)));
  });

  it('should apply discount prestige upgrade', () => {
    const normalCost = getBuildingCost('cursor', 5, false);
    const discountedCost = getBuildingCost('cursor', 5, true);

    // Discounted should be lower due to smaller multiplier
    expect(discountedCost).toBeLessThan(normalCost);
    expect(discountedCost).toBe(Math.floor(15 * Math.pow(1.135, 5)));
  });

  it('should return Infinity for unknown buildings', () => {
    const cost = getBuildingCost('nonexistent', 0, false);
    expect(cost).toBe(Infinity);
  });
});

describe('CPS Calculation', () => {
  it('should return 0 CPS with no buildings', () => {
    const state = createInitialGameState();
    const cps = getBaseCps(state.buildings);
    expect(cps).toBe(0);
  });

  it('should calculate base CPS from buildings', () => {
    const buildings = {
      cursor: { owned: 5 },
      grandma: { owned: 2 },
    };

    // Cursor: 0.1 CPS * 5 = 0.5
    // Grandma: 1 CPS * 2 = 2
    // Total: 2.5
    const cps = getBaseCps(buildings as any);
    expect(cps).toBeCloseTo(2.5, 5);
  });

  it('should apply global multiplier to CPS', () => {
    const state = createInitialGameState();
    state.buildings.cursor.owned = 10; // 10 cursors = 1 base CPS
    state.globalMultiplier = 2; // Double CPS

    const totalCps = getTotalCps(state);
    expect(totalCps).toBe(2);
  });
});

describe('Prestige Calculation', () => {
  it('should return 0 chips for low cookie counts', () => {
    const chips = calculateTotalHeavenlyChips(1000000); // 1 million
    expect(chips).toBe(0); // sqrt(1e6 / 1e12) < 1
  });

  it('should calculate chips correctly for high cookie counts', () => {
    // Need at least 1 trillion for first chip
    const chips = calculateTotalHeavenlyChips(1e12);
    expect(chips).toBe(1);

    // 4 trillion = sqrt(4) = 2 chips
    const chips2 = calculateTotalHeavenlyChips(4e12);
    expect(chips2).toBe(2);

    // 100 trillion = sqrt(100) = 10 chips
    const chips3 = calculateTotalHeavenlyChips(1e14);
    expect(chips3).toBe(10);
  });

  it('should calculate potential gain correctly', () => {
    const info = calculatePrestigeInfo(4e12, 1); // 2 total - 1 current = 1 gain
    expect(info.totalChips).toBe(2);
    expect(info.currentChips).toBe(1);
    expect(info.potentialGain).toBe(1);
  });

  it('should return 0 potential when no gain available', () => {
    const info = calculatePrestigeInfo(4e12, 2); // Already have 2 chips
    expect(info.potentialGain).toBe(0);
  });
});

describe('Offline Cookie Calculation', () => {
  it('should calculate offline cookies with default multiplier', () => {
    // 100 CPS, 1 hour (3600 seconds), 50% multiplier
    const offline = calculateOfflineCookies(100, 3600, 0.5, false);
    expect(offline).toBe(100 * 3600 * 0.5); // 180,000
  });

  it('should use 100% multiplier with boost', () => {
    const offline = calculateOfflineCookies(100, 3600, 0.5, true);
    expect(offline).toBe(100 * 3600 * 1.0); // 360,000
  });
});

describe('Building Purchase', () => {
  it('should succeed when cookies are sufficient', () => {
    const result = attemptBuildingPurchase(100, 'cursor', 0, false);
    expect(result.success).toBe(true);
    expect(result.cost).toBe(15);
    expect(result.newCookies).toBe(85);
    expect(result.newOwned).toBe(1);
  });

  it('should fail when cookies are insufficient', () => {
    const result = attemptBuildingPurchase(10, 'cursor', 0, false);
    expect(result.success).toBe(false);
    expect(result.cost).toBe(15);
    expect(result.newCookies).toBe(10);
    expect(result.newOwned).toBe(0);
  });
});

describe('Milestone System', () => {
  it('should detect milestones at thresholds', () => {
    expect(checkMilestone(100)).toBe(100);
    expect(checkMilestone(500)).toBe(500);
    expect(checkMilestone(1000)).toBe(1000);
    expect(checkMilestone(2000)).toBe(2000);
  });

  it('should return null for non-milestones', () => {
    expect(checkMilestone(99)).toBeNull();
    expect(checkMilestone(101)).toBeNull();
    expect(checkMilestone(501)).toBeNull();
  });
});

describe('Number Formatting', () => {
  it('should format small numbers without suffix', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(100)).toBe('100');
    expect(formatNumber(999)).toBe('999');
  });

  it('should format thousands with K suffix', () => {
    expect(formatNumber(1000)).toBe('1.00K');
    expect(formatNumber(1500)).toBe('1.50K');
    // 999999 / 1000 = 999.999 -> rounds to 1000.00K
    expect(formatNumber(999999)).toBe('1000.00K');
  });

  it('should format millions with M suffix', () => {
    expect(formatNumber(1000000)).toBe('1.00M');
    expect(formatNumber(50000000)).toBe('50.00M');
  });

  it('should format billions with B suffix', () => {
    expect(formatNumber(1000000000)).toBe('1.00B');
  });

  it('should format trillions with T suffix', () => {
    expect(formatNumber(1000000000000)).toBe('1.00T');
  });
});

describe('Initial State Factory', () => {
  it('should create valid initial state', () => {
    const state = createInitialGameState();

    expect(state.cookies).toBe(0);
    expect(state.totalCookies).toBe(0);
    expect(state.clicks).toBe(0);
    expect(state.clickPower).toBe(1);
    expect(state.globalMultiplier).toBe(1);

    // Buildings should exist for all keys in catalog
    for (const key in BUILDINGS) {
      expect(state.buildings[key]).toBeDefined();
      expect(state.buildings[key].owned).toBe(0);
    }
  });
});

describe('Prestige Reset', () => {
  it('should return unchanged state when no prestige available', () => {
    const state = createInitialGameState();
    const newState = performPrestige(state);

    // Should be unchanged
    expect(newState.cookies).toBe(state.cookies);
  });

  it('should reset buildings and cookies on prestige', () => {
    const state = createInitialGameState();
    state.totalCookiesAllTime = 4e12; // 4 trillion = 2 chips
    state.heavenlyChips = 0;
    state.buildings.cursor.owned = 100;
    state.cookies = 1000000;

    const newState = performPrestige(state);

    expect(newState.cookies).toBe(0);
    expect(newState.buildings.cursor.owned).toBe(0);
    expect(newState.heavenlyChips).toBe(2);
    expect(newState.prestigeCount).toBe(1);
  });

  it('should give starter cookies with prestige upgrade', () => {
    const state = createInitialGameState();
    state.totalCookiesAllTime = 4e12;
    state.heavenlyChips = 0;
    state.prestigeUpgrades.starterCookies.purchased = true;

    const newState = performPrestige(state);

    expect(newState.cookies).toBe(100); // Starter pack bonus
  });
});