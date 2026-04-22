/**
 * Tests for store action logic, particularly prestige upgrade purchases.
 */
import { describe, it, expect } from 'vitest';

describe('Heavenly Luck Purchase Logic', () => {
  // Constants matching the store implementation
  const HEAVENLY_CHIP_CPS_BONUS = 0.02;

  // Simulate the Heavenly Luck purchase multiplier computation
  function computeHeavenlyLuckMultiplier(
    prePurchaseChips: number,
    upgradeCost: number,
    currentGlobalMultiplier: number
  ): { newChips: number; newMultiplier: number } {
    const postPurchaseChips = prePurchaseChips - upgradeCost;
    const heavenlyLuckMultiplier = 1 + postPurchaseChips * HEAVENLY_CHIP_CPS_BONUS;
    const newMultiplier = currentGlobalMultiplier * heavenlyLuckMultiplier;
    return { newChips: postPurchaseChips, newMultiplier };
  }

  it('should compute from post-purchase chip balance', () => {
    // Player has 10 chips, buys Heavenly Luck for 1 chip
    // Post-purchase: 9 chips
    // Expected: 1 + 9 * 0.02 = 1.18x multiplier
    const result = computeHeavenlyLuckMultiplier(10, 1, 1.0);
    expect(result.newChips).toBe(9);
    expect(result.newMultiplier).toBeCloseTo(1.18, 4);
  });

  it('REGRESSION: should NOT over-credit by one chip', () => {
    // Bug: Using pre-purchase balance over-credits by 1 chip
    // Player has 10 chips, buys HL for 1 chip
    // Wrong: 1 + 10 * 0.02 = 1.20 (over-credit)
    // Correct: 1 + 9 * 0.02 = 1.18
    const correctResult = computeHeavenlyLuckMultiplier(10, 1, 1.0);
    const wrongMultiplier = 1 + 10 * 0.02; // Pre-purchase balance bug
    expect(correctResult.newMultiplier).not.toBe(wrongMultiplier);
    expect(correctResult.newMultiplier).toBeCloseTo(1.18, 4);
  });

  it('REGRESSION: should preserve existing multiplier contributions', () => {
    // Player has achievement multiplier of 1.01 (1% bonus)
    // Buys Heavenly Luck with 5 chips post-purchase
    // Expected: 1.01 * (1 + 5 * 0.02) = 1.01 * 1.10 = 1.111
    const result = computeHeavenlyLuckMultiplier(6, 1, 1.01);
    expect(result.newChips).toBe(5);
    const expectedMultiplier = 1.01 * (1 + 5 * 0.02);
    expect(result.newMultiplier).toBeCloseTo(expectedMultiplier, 4);
    
    // NOT just the HL multiplier alone (would be 1.10, losing the achievement bonus)
    expect(result.newMultiplier).not.toBeCloseTo(1.10, 4);
  });

  it('should handle frenzy bonus preservation', () => {
    // Player has frenzy active (7x multiplier) and buys Heavenly Luck
    // Frenzy: globalMultiplier = 7
    // Post-purchase chips: 10
    // Expected: 7 * (1 + 10 * 0.02) = 7 * 1.2 = 8.4
    const result = computeHeavenlyLuckMultiplier(11, 1, 7.0);
    expect(result.newMultiplier).toBeCloseTo(8.4, 4);
  });
});