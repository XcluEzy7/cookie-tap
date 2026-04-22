# ADR-7: Offline/Save Lifecycle Compliance

## Overview

This document describes how CookieTap implements offline/save lifecycle according to ADR-7 requirements.

## Architecture

### Source of Truth

**`src/lib/game/persistence.ts`** is the single source of truth for:
- Save data hydration and parsing
- Legacy migration (v1 → v2)
- Save data extraction from GameState
- localStorage operations

### Client Runtime Layer

**`src/lib/client-runtime/`** handles all browser lifecycle concerns:
- Service worker registration
- Install prompt management (`install-prompt.ts`)
- Page visibility hooks (`visibility.ts`)
- Autosave orchestration (`autosave.ts`)

**Key Principle:** Service worker/cache state NEVER mutates gameplay state. It only supports delivery.

## Offline Earnings Flow

1. **On page load** (`initGame()` in `src/lib/stores/game.ts`):
   - `loadGame()` from persistence module is called
   - Legacy saves are migrated to v2 format
   - Offline time is calculated: `Date.now() - state.lastSave`
   - Offline cookies computed via `calculateOfflineCps()`
   - If offline time > 60s and CPS > 0, modal state is set
   - Offline cookies added to cookies, totalCookies, and totalCookiesAllTime

2. **Offline modal display**:
   - Modal shown via `$modals.offline.show` reactive state
   - `OfflineModal` component displays earnings
   - User dismisses to continue

## Autosave Flow

**`src/lib/client-runtime/autosave.ts`:**

```
Interval save (every 5s)
  └── Calls saveGame(state) → localStorage.setItem

Visibility save (on hidden)
  └── Triggers on document.visibilityState === 'hidden'

Before-unload save
  └── Synchronous localStorage write on window.beforeunload
```

## Service Worker

**`src/service-worker.ts`:**

```typescript
// Install: Cache all static assets
// Activate: Clean old caches
// Fetch: Cache-first, fallback to network
```

**Note:** Service worker serves offline shell only. Game state is managed via localStorage, not cache.

## PWA Install Flow

**`src/lib/client-runtime/install-prompt.ts`:**

1. `beforeinstallprompt` event is captured
2. Event stored in module state
3. UI can call `showInstallPrompt()` to trigger native prompt
4. On acceptance, app is installed

## Failure Modes and Recovery

### 1. localStorage Quota Exceeded

**Symptom:** `saveGame()` returns `false`, console warning.

**Recovery:**
- Game continues in memory
- Next autosave attempt may succeed
- User sees no disruption

**Code Implementation:**
```typescript
export function saveGame(state: GameState): boolean {
  try {
    const saveData = extractSaveData(state);
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    return true;
  } catch (e) {
    console.warn('Could not save game:', e);
    return false;
  }
}
```

### 2. Corrupted Save Data

**Symptom:** `parseSaveData()` returns `null`.

**Recovery:**
- Return default initial state
- No offline earnings (no lastSave timestamp)
- User starts fresh

**Code Implementation:**
```typescript
export function loadGame(): LoadResult {
  const defaults = createInitialGameState();
  
  try {
    const json = localStorage.getItem(SAVE_KEY);
    if (!json) return { state: defaults, ... };
    
    let data = parseSaveData(json);
    if (!data) return { state: defaults, ... };
    
    // Migration handles legacy format
    if (isLegacySave(data)) {
      data = migrateLegacySave(data);
    }
    // ...
  } catch (e) {
    return { state: defaults, ... };
  }
}
```

### 3. Legacy Save Version

**Symptom:** Save lacks `version` field (v1 format).

**Recovery:**
- Automatic migration via `migrateLegacySave()`
- All v1 fields preserved
- Missing v2 fields get defaults
- User sees migrated progress

### 4. Service Worker Registration Failed

**Symptom:** Console warning, PWA features unavailable.

**Recovery:**
- Game works normally
- No offline shell support
- Install prompt unavailable

**Code Implementation:**
```typescript
// client-runtime/index.ts
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/service-worker.js')
    .catch((err) => console.warn('Service worker registration failed:', err));
}
```

### 5. Page Closed Without Save

**Symptom:** Browser closed abruptly, `beforeunload` save may not complete.

**Recovery:**
- Autosave interval (5s) minimizes data loss window
- Visibility save on `hidden` state catches most cases
- Offline earnings calculated on next load from `lastSave`

### 6. Concurrent Tab Edit

**Symptom:** Multiple tabs editing same localStorage.

**Recovery:**
- Last-write-wins semantics (localStorage is synchronous)
- Each tab maintains its own in-memory state
- Refresh syncs to latest storage

## Cache Rotation

Service worker version is tied to build version:

```typescript
// service-worker.ts
const CACHE_NAME = `cookie-tap-v${version}`;
```

On new deployment:
1. New service worker activates
2. Old caches deleted in `activate` event
3. New assets cached in `install` event
4. `self.clients.claim()` refreshes all tabs

## GitHub Pages Deployment

The static adapter outputs to `build/` directory:
- `index.html` - Main entry
- `manifest.json` - PWA manifest
- `service-worker.js` - Offline shell
- `_app/` - Versioned immutable assets

**Base path:** `/cookie-tap/` (configured in `svelte.config.js`)

## Verification Checklist

- [x] Save data stored in localStorage with version `2`
- [x] Legacy v1 saves migrated automatically
- [x] Offline earnings calculated on resume
- [x] Offline modal displays earnings
- [x] Autosave runs every 5 seconds
- [x] Save on visibility hidden
- [x] Save on beforeunload
- [x] Service worker caches static assets
- [x] PWA install prompt available
- [x] Error handling returns defaults
- [x] Tests pass (45 tests in 3 files)
- [x] Build succeeds

## Related Files

| File | Purpose |
|------|---------|
| `src/lib/game/persistence.ts` | Save/load/migrate logic |
| `src/lib/game/schema.ts` | Save data types (v1, v2) |
| `src/lib/stores/game.ts` | Game loop, init, state |
| `src/lib/client-runtime/index.ts` | PWA orchestration |
| `src/lib/client-runtime/autosave.ts` | Autosave intervals |
| `src/lib/client-runtime/visibility.ts` | Page visibility hooks |
| `src/lib/client-runtime/install-prompt.ts` | PWA install |
| `src/service-worker.ts` | Offline shell |
| `src/lib/components/OfflineModal.svelte` | Offline earnings UI |