/**
 * UI Notifications Facade
 * 
 * Provides an explicit UI-facing contract for timing and notification events.
 * This is the single boundary for:
 * - Golden cookie spawn/click lifecycle
 * - News ticker rotation
 * - Achievement/milestone/event popup display
 * 
 * ADR-5 compliant: UI components receive state from this facade, not from timers.
 */

import { writable, get } from 'svelte/store';
import type { Writable } from 'svelte/store';
import { gameState } from '../stores/game';
import {
  GOLDEN_SPAWN_COOLDOWN,
  GOLDEN_SPAWN_CHECK_INTERVAL,
  GOLDEN_SPAWN_CHANCE,
  GOLDEN_SPAWN_CHANCE_BOOSTED,
  NEWS_HEADLINES,
  NEWS_ROTATION_INTERVAL,
} from '../game/catalog';

// ============================================
// GOLDEN COOKIE STATE
// ============================================

export interface GoldenCookieState {
  visible: boolean;
  x: number;
  y: number;
}

export const goldenCookie: Writable<GoldenCookieState> = writable({
  visible: false,
  x: 0,
  y: 0,
});

let goldenCookieInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Start the golden cookie spawn timer.
 * Called by runtime during app initialization.
 */
export function startGoldenCookieSpawner(): void {
  if (goldenCookieInterval !== null) return;

  goldenCookieInterval = setInterval(() => {
    const state = get(gameState);
    const hasBoost = state.prestigeUpgrades.goldenFrequenter?.purchased ?? false;
    const chance = hasBoost ? GOLDEN_SPAWN_CHANCE_BOOSTED : GOLDEN_SPAWN_CHANCE;
    const now = Date.now();

    if (Math.random() < chance && now - state.lastGoldenCookie > GOLDEN_SPAWN_COOLDOWN) {
      spawnGoldenCookie();
    }
  }, GOLDEN_SPAWN_CHECK_INTERVAL);
}

/**
 * Stop the golden cookie spawn timer.
 */
export function stopGoldenCookieSpawner(): void {
  if (goldenCookieInterval !== null) {
    clearInterval(goldenCookieInterval);
    goldenCookieInterval = null;
  }
}

/**
 * Spawn a golden cookie at a random position.
 * Called internally by the spawner, or externally for testing.
 */
export function spawnGoldenCookie(): void {
  goldenCookie.set({
    visible: true,
    x: 50 + Math.random() * (window.innerWidth - 150),
    y: 100 + Math.random() * (window.innerHeight - 200),
  });
}

/**
 * Handle golden cookie click.
 * Called by UI component when user clicks the golden cookie.
 * Returns true if a golden cookie was visible and clicked.
 */
export function clickGoldenCookie(): boolean {
  const current = get(goldenCookie);
  if (!current.visible) return false;

  goldenCookie.update((s) => ({ ...s, visible: false }));
  
  return true;
}

// ============================================
// NEWS TICKER STATE
// ============================================

export const newsHeadline: Writable<string> = writable(NEWS_HEADLINES[0]);

let newsRotationInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Start the news ticker rotation timer.
 * Called by runtime during app initialization.
 */
export function startNewsTickerRotation(): void {
  if (newsRotationInterval !== null) return;

  newsRotationInterval = setInterval(() => {
    newsHeadline.set(NEWS_HEADLINES[Math.floor(Math.random() * NEWS_HEADLINES.length)]);
  }, NEWS_ROTATION_INTERVAL);
}

/**
 * Stop the news ticker rotation timer.
 */
export function stopNewsTickerRotation(): void {
  if (newsRotationInterval !== null) {
    clearInterval(newsRotationInterval);
    newsRotationInterval = null;
  }
}

// ============================================
// NOTIFICATION BANNERS STATE
// ============================================

export interface NotificationBanner {
  visible: boolean;
  title: string;
  message: string;
}

export const achievementNotification: Writable<NotificationBanner> = writable({
  visible: false,
  title: '',
  message: '',
});

export const eventBanner: Writable<NotificationBanner> = writable({
  visible: false,
  title: '',
  message: '',
});

export const milestoneBanner: Writable<NotificationBanner> = writable({
  visible: false,
  title: '',
  message: '',
});

let achievementTimeout: ReturnType<typeof setTimeout> | null = null;
let eventTimeout: ReturnType<typeof setTimeout> | null = null;
let milestoneTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Display an achievement notification popup.
 * Called by game logic when an achievement is unlocked.
 */
export function showAchievement(name: string, description: string, duration = 4000): void {
  if (achievementTimeout !== null) clearTimeout(achievementTimeout);

  achievementNotification.set({ visible: true, title: name, message: description });

  achievementTimeout = setTimeout(() => {
    achievementNotification.update((n) => ({ ...n, visible: false }));
  }, duration);
}

/**
 * Display an event banner.
 * Called by game logic when a random event occurs.
 */
export function showEventBanner(name: string, description: string, duration = 5000): void {
  if (eventTimeout !== null) clearTimeout(eventTimeout);

  eventBanner.set({ visible: true, title: name, message: description });

  eventTimeout = setTimeout(() => {
    eventBanner.update((n) => ({ ...n, visible: false }));
  }, duration);
}

/**
 * Display a milestone banner.
 * Called by game logic when a building milestone is reached.
 */
export function showMilestone(title: string, description: string, duration = 3000): void {
  if (milestoneTimeout !== null) clearTimeout(milestoneTimeout);

  milestoneBanner.set({ visible: true, title, message: description });

  milestoneTimeout = setTimeout(() => {
    milestoneBanner.update((n) => ({ ...n, visible: false }));
  }, duration);
}

// ============================================
// RUNTIME LIFECYCLE
// ============================================

/**
 * Start all UI notification systems.
 * Called once during app initialization.
 */
export function startUINotifications(): void {
  startGoldenCookieSpawner();
  startNewsTickerRotation();
}

/**
 * Stop all UI notification systems.
 * Called during app cleanup.
 */
export function stopUINotifications(): void {
  stopGoldenCookieSpawner();
  stopNewsTickerRotation();

  if (achievementTimeout !== null) clearTimeout(achievementTimeout);
  if (eventTimeout !== null) clearTimeout(eventTimeout);
  if (milestoneTimeout !== null) clearTimeout(milestoneTimeout);
}