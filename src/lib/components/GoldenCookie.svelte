<script lang="ts">
  import { gameState, GOLDEN_SPAWN_COOLDOWN, GOLDEN_SPAWN_CHECK_INTERVAL } from '$lib/stores/game';
  import { get } from 'svelte/store';
  import { onMount, onDestroy } from 'svelte';

  let show = $state(false);
  let position = $state({ x: 0, y: 0 });
  let goldenInterval: ReturnType<typeof setInterval>;

  function spawn() {
    show = true;
    position = {
      x: 50 + Math.random() * (window.innerWidth - 150),
      y: 100 + Math.random() * (window.innerHeight - 200),
    };
  }

  function handleClick() {
    show = false;
    // Dispatch custom event for parent to handle
    window.dispatchEvent(new CustomEvent('golden-cookie-clicked'));
  }

  onMount(() => {
    // Check for spawn periodically - store reference to use in interval
    goldenInterval = setInterval(() => {
      const state = get(gameState);
      const hasBoost = state.prestigeUpgrades.goldenFrequenter?.purchased ?? false;
      const chance = hasBoost ? 0.5 : 0.25;
      const now = Date.now();

      if (
        Math.random() < chance &&
        now - state.lastGoldenCookie > GOLDEN_SPAWN_COOLDOWN
      ) {
        spawn();
      }
    }, GOLDEN_SPAWN_CHECK_INTERVAL);
  });

  onDestroy(() => {
    if (goldenInterval) clearInterval(goldenInterval);
  });
</script>

{#if show}
  <div
    class="golden-cookie"
    style="left: {position.x}px; top: {position.y}px;"
    onclick={handleClick}
    role="button"
    tabindex="0"
    onkeydown={(e) => e.key === 'Enter' && handleClick()}
  >
    🌟
  </div>
{/if}

<style>
  .golden-cookie {
    position: fixed;
    width: 80px;
    height: 80px;
    background: radial-gradient(circle at 30% 30%, #FFD700, #FFA500);
    border-radius: 50%;
    cursor: pointer;
    z-index: 1000;
    animation: golden-pulse 1s ease-in-out infinite, golden-float 3s ease-in-out infinite;
    box-shadow: 0 0 40px rgba(255, 215, 0, 0.9), 0 0 80px rgba(255, 215, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
  }

  @keyframes golden-pulse {
    0%,
    100% {
      transform: scale(1);
      box-shadow: 0 0 40px rgba(255, 215, 0, 0.9), 0 0 80px rgba(255, 215, 0, 0.5);
    }
    50% {
      transform: scale(1.1);
      box-shadow: 0 0 60px rgba(255, 215, 0, 1), 0 0 120px rgba(255, 215, 0, 0.7);
    }
  }

  @keyframes golden-float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
</style>