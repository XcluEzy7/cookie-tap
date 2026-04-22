<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { gameState, initGame, startGameLoop, stopGameLoop } from '$lib/stores/game';
  import { initClientRuntime } from '$lib/client-runtime';
  import { startUINotifications, stopUINotifications } from '$lib/runtime/ui-notifications';
  import OfflineModal from '$lib/components/OfflineModal.svelte';

  let { children } = $props();
  
  let cleanup: (() => void) | null = null;

  onMount(() => {
    // Initialize game state from save (handles offline earnings, migration)
    initGame();
    
    // Start the game loop for CPS accumulation
    startGameLoop();

    // Start UI notification systems (golden cookie spawner, news ticker)
    startUINotifications();

    // Initialize PWA runtime (service worker, visibility hooks, autosave)
    // Note: Install prompt is handled by Footer component for single-ownership UI boundary
    cleanup = initClientRuntime({
      getState: () => $gameState,
      onPageVisible: () => {
        // Page became visible - could recalculate time-based state here
      },
      onPageHidden: () => {
        // Page hidden - autosave already handled by client-runtime
      },
    });
  });

  onDestroy(() => {
    cleanup?.();
    stopGameLoop();
    stopUINotifications();
  });
</script>

<OfflineModal />

{@render children()}