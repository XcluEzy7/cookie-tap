<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { gameState, modals, initGame, startGameLoop, stopGameLoop } from '$lib/stores/game';
  import { initClientRuntime, showInstallPrompt } from '$lib/client-runtime';
  import OfflineModal from '$lib/components/OfflineModal.svelte';

  let { children } = $props();
  
  let showInstall = $state(false);
  let cleanup: (() => void) | null = null;

  onMount(() => {
    // Initialize game state from save (handles offline earnings, migration)
    initGame();
    
    // Start the game loop for CPS accumulation
    startGameLoop();

    // Initialize PWA runtime (service worker, install prompt, visibility hooks, autosave)
    cleanup = initClientRuntime({
      getState: () => $gameState,
      onInstallPromptReady: () => {
        showInstall = true;
      },
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
  });

  async function installPwa(): Promise<void> {
    await showInstallPrompt();
    showInstall = false;
  }
</script>

<OfflineModal />

{@render children()}