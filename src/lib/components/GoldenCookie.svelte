<script lang="ts">
  import { goldenCookie } from '$lib/runtime/ui-notifications';
  import { handleGoldenCookieClick } from '$lib/stores/game';

  let gc = $derived($goldenCookie);

  function handleClick() {
    if (gc.visible) {
      handleGoldenCookieClick();
    }
  }
</script>

{#if gc.visible}
  <div
    class="golden-cookie"
    style="left: {gc.x}px; top: {gc.y}px;"
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