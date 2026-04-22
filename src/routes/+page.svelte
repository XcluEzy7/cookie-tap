<script lang="ts">
  import { gameState, cps, clickPower, BUILDINGS } from '$lib/stores/game';
  import { formatNumber, getBuildingCostNow, canAffordBuilding, buyBuilding } from '$lib/stores/game';
  import { TICK_INTERVAL } from '$lib/game/catalog';
  
  // Props from layout
  let { showInstall = false, installPwa }: { showInstall?: boolean; installPwa?: () => Promise<void> } = $props();
  
  // Game state subscriptions (Svelte 5 runes)
  let state = $derived($gameState);
  let currentCps = $derived($cps);
  let currentClickPower = $derived($clickPower);
  
  // Simple click action (inline to avoid component complexity)
  function clickCookie(): void {
    import('$lib/stores/game').then(({ clickCookie }) => clickCookie());
  }
  
  // Format helpers
  function fmt(n: number): string {
    return formatNumber(Math.floor(n));
  }
</script>

<svelte:head>
  <title>Cookie Clicker - Enhanced Edition</title>
</svelte:head>

<main>
  <header class="header">
    <h1>🍪 Cookie Clicker - Enhanced Edition</h1>
    <div class="stats">
      <div class="stat">Cookies: <span>{fmt(state.cookies)}</span></div>
      <div class="stat">Per second: <span>{fmt(currentCps)}</span></div>
      <div class="stat">Clicks: <span>{fmt(state.clicks)}</span></div>
      {#if state.heavenlyChips > 0 || state.totalHeavenlyChips > 0}
        <div class="stat heavenly">💎 {fmt(state.heavenlyChips)}</div>
      {/if}
    </div>
    {#if state.globalMultiplier > 1}
      <div class="multiplier">CPS ×{state.globalMultiplier.toFixed(2)}</div>
    {/if}
  </header>

  <section class="cookie-section">
    <div
      class="cookie"
      onclick={clickCookie}
      role="button"
      tabindex="0"
      onkeydown={(e) => e.key === 'Enter' && clickCookie()}
    >
      🍪
    </div>
    <p>Click Power: {fmt(currentClickPower)}</p>
  </section>

  <section class="shop">
    <h2>Shop</h2>
    {#each Object.entries(BUILDINGS) as [key, building]}
      <button
        class="upgrade"
        class:affordable={canAffordBuilding(key)}
        onclick={() => buyBuilding(key)}
      >
        <span class="icon">{building.icon}</span>
        <div class="info">
          <div class="name">{building.name}</div>
          <div class="cost">Cost: {fmt(getBuildingCostNow(key))} cookies</div>
          <div class="cps">+{fmt(building.baseCps)} CPS</div>
        </div>
        <span class="owned">{state.buildings[key]?.owned ?? 0}</span>
      </button>
    {/each}
  </section>

  <footer>
    {#if showInstall && installPwa}
      <button onclick={installPwa}>📱 Install App</button>
    {/if}
  </footer>
</main>

<style>
  :global(body) {
    font-family: 'Nunito', sans-serif;
    background: linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #1E1B4B 100%);
    color: #E0E7FF;
    min-height: 100vh;
    margin: 0;
  }

  :global(h1, h2) {
    font-family: 'Fredoka', sans-serif;
  }

  main {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }

  .header {
    text-align: center;
    padding: 20px;
    background: linear-gradient(135deg, rgba(79, 70, 229, 0.4), rgba(55, 48, 163, 0.5));
    border-radius: 20px;
    margin-bottom: 20px;
  }

  h1 {
    font-size: 2rem;
    margin-bottom: 10px;
  }

  .stats {
    display: flex;
    justify-content: center;
    gap: 15px;
    flex-wrap: wrap;
  }

  .stat {
    background: rgba(255, 255, 255, 0.1);
    padding: 8px 16px;
    border-radius: 20px;
  }

  .stat.heavenly {
    background: rgba(147, 112, 219, 0.3);
    color: #FCD34D;
  }

  .multiplier {
    margin-top: 10px;
    color: #FCD34D;
    font-weight: bold;
  }

  .cookie-section {
    text-align: center;
    margin-bottom: 30px;
  }

  .cookie {
    font-size: 150px;
    cursor: pointer;
    user-select: none;
    transition: transform 0.1s;
    filter: drop-shadow(0 0 30px rgba(79, 70, 229, 0.8));
    display: inline-block;
  }

  .cookie:hover {
    transform: scale(1.1);
  }

  .cookie:active {
    transform: scale(0.95);
  }

  .shop {
    background: rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    padding: 20px;
  }

  h2 {
    text-align: center;
    margin-bottom: 15px;
    color: white;
  }

  .upgrade {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 15px;
    margin-bottom: 10px;
    background: rgba(79, 70, 229, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
    color: inherit;
    font-family: inherit;
  }

  .upgrade:hover {
    background: rgba(99, 102, 241, 0.25);
    transform: translateX(5px);
  }

  .upgrade.affordable {
    border-color: #10B981;
    background: rgba(16, 185, 129, 0.3);
  }

  .icon {
    font-size: 2rem;
    margin-right: 10px;
  }

  .info {
    flex: 1;
    text-align: left;
  }

  .name {
    font-weight: bold;
    font-size: 1.1rem;
  }

  .cost {
    color: #F97316;
    font-size: 0.9rem;
  }

  .cps {
    font-size: 0.85rem;
    opacity: 0.8;
  }

  .owned {
    font-size: 1.5rem;
    font-weight: bold;
    min-width: 40px;
    text-align: center;
  }

  footer {
    text-align: center;
    padding: 20px;
  }

  footer button {
    padding: 12px 24px;
    border: none;
    border-radius: 25px;
    background: linear-gradient(135deg, #4F46E5, #6366F1);
    color: white;
    font-weight: bold;
    cursor: pointer;
    transition: transform 0.2s;
  }

  footer button:hover {
    transform: translateY(-3px);
  }
</style>