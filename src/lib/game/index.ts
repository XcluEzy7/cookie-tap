/**
 * CookieTap Game Module Index
 * Re-exports all domain modules for convenient imports.
 */

// Types and schemas
export * from './schema';

// Static catalog data
export * from './catalog';

// Pure calculation engine
export * from './engine';

// Persistence and migration
export * from './persistence';

// Effects (golden cookies, random events)
export * from './effects';

// Re-export specific items for convenience
export { GARDEN_CROPS, GARDEN_REWARDS, GARDEN_GROWTH_TIME, GARDEN_UNLOCK_THRESHOLD, GARDEN_INITIAL_SEEDS, GARDEN_PLOT_COUNT, GOLDEN_SPAWN_COOLDOWN, GOLDEN_SPAWN_CHANCE, GOLDEN_SPAWN_CHANCE_BOOSTED, GOLDEN_DESPAWN_TIME, GOLDEN_SPAWN_CHECK_INTERVAL, RANDOM_EVENT_CHECK_INTERVAL, CPS_FRENZY_DURATION, CLICK_FRENZY_DURATION } from './catalog';