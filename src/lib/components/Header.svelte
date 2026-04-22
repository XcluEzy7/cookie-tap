<script lang="ts">
  import { base } from '$app/paths';
  import { gameState, cps } from '$lib/stores/game';
  import { formatNumber } from '$lib/game/engine';

  $: state = $gameState;
  $: currentCps = $cps;
</script>

<svelte:head>
  <title>Cookie Clicker - Enhanced Edition</title>
</svelte:head>

<header>
  <h1>🍪 Cookie Clicker - Enhanced Edition</h1>
  <div class="stats">
    <div class="stat">Cookies: <span>{formatNumber(Math.floor(state.cookies))}</span></div>
    <div class="stat">Per second: <span>{formatNumber(currentCps)}</span></div>
    <div class="stat">Clicks: <span>{formatNumber(state.clicks)}</span></div>
    {#if state.heavenlyChips > 0 || state.totalHeavenlyChips > 0}
      <div class="stat heavenly">
        Heavenly Chips: <span>{formatNumber(state.heavenlyChips)}</span>
      </div>
    {/if}
  </div>
  {#if state.globalMultiplier > 1 || state.clickMultiplier > 1}
    <div class="multiplier-display">
      {#if state.clickMultiplier > 1}
        <span>Click x{formatNumber(state.clickMultiplier)}</span>
      {/if}
      {#if state.globalMultiplier > 1}
        <span>CPS x{formatNumber(state.globalMultiplier)}</span>
      {/if}
    </div>
  {/if}
</header>

<style>
  header {
    text-align: center;
    padding: 20px;
    background: linear-gradient(135deg, rgba(79, 70, 229, 0.4), rgba(55, 48, 163, 0.5));
    color: #FFFFFF;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    border-bottom: 1px solid rgba(255, 255, 255, 0.18);
    backdrop-filter: blur(10px);
  }

  h1 {
    font-family: 'Fredoka', sans-serif;
    font-size: 2.5rem;
    margin-bottom: 10px;
    text-shadow: 0 0 20px rgba(79, 70, 229, 0.8);
    letter-spacing: 1px;
  }

  .stats {
    display: flex;
    justify-content: center;
    gap: 30px;
    font-size: 1.2rem;
    flex-wrap: wrap;
  }

  .stat {
    background: rgba(255, 255, 255, 0.08);
    padding: 10px 20px;
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.18);
    backdrop-filter: blur(5px);
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  .stat:hover {
    transform: translateY(-3px);
    box-shadow: 0 0 15px rgba(79, 70, 229, 0.4);
  }

  .stat.heavenly {
    background: rgba(147, 112, 219, 0.3);
    box-shadow: 0 0 15px rgba(147, 112, 219, 0.4);
  }

  .multiplier-display {
    margin-top: 10px;
    color: #FCD34D;
    font-weight: bold;
    display: flex;
    gap: 15px;
    justify-content: center;
  }
</style>