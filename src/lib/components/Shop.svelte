<script lang="ts">
  let activeTab = 'buildings';

  // Import store subscriptions at module level
  import { gameState, buyBuilding, canAffordBuilding, getBuildingCostNow, formatNumber } from '$lib/stores/game';
  import { BUILDINGS, BUILDING_KEYS, PRESTIGE_UPGRADES } from '$lib/game/catalog';

  // Subscribe to stores reactively
  $: gameData = $gameState;
  $: gardenUnlocked = gameData.cookies >= 1000 || gameData.garden.unlocked;
  $: prestigeUnlocked = gameData.heavenlyChips > 0 || gameData.totalHeavenlyChips > 0;

  function handleBuildingClick(key: string) {
    buyBuilding(key);
  }
</script>

<section id="shop">
  <h2>Shop</h2>

  <div class="shop-tabs">
    <button
      class="shop-tab"
      class:active={activeTab === 'buildings'}
      onclick={() => (activeTab = 'buildings')}
    >
      Buildings
    </button>
    <button
      class="shop-tab"
      class:active={activeTab === 'achievements'}
      onclick={() => (activeTab = 'achievements')}
    >
      Achievements
    </button>
    <button
      class="shop-tab"
      class:active={activeTab === 'garden'}
      onclick={() => (activeTab = 'garden')}
    >
      Garden
    </button>
    {#if prestigeUnlocked}
      <button
        class="shop-tab"
        class:active={activeTab === 'prestige'}
        onclick={() => (activeTab = 'prestige')}
      >
        Prestige
      </button>
    {/if}
  </div>

  <div class="shop-panel" class:active={activeTab === 'buildings'}>
    <div class="upgrades">
      {#each BUILDING_KEYS as key}
        {@const building = BUILDINGS[key]}
        {@const owned = gameData.buildings[key]?.owned ?? 0}
        {@const cost = getBuildingCostNow(key)}
        {@const affordable = canAffordBuilding(key)}
        <button
          class="upgrade"
          class:affordable
          onclick={() => handleBuildingClick(key)}
          disabled={!affordable}
        >
          <span class="icon">{building.icon}</span>
          <div class="info">
            <div class="name">{building.name}</div>
            <div class="cost">Cost: {formatNumber(cost)} cookies</div>
            <div class="cps">+{formatNumber(building.baseCps)} CPS</div>
          </div>
          <span class="owned">{owned}</span>
        </button>
      {/each}
    </div>
  </div>

  <div class="shop-panel" class:active={activeTab === 'achievements'}>
    <div class="achievements-list">
      {#each Object.entries(gameData.achievements) as [key, ach]}
        <div class="achievement" class:unlocked={ach.unlocked}>
          <div class="achievement-icon">{ach.unlocked ? '🏆' : '🔒'}</div>
          <div class="achievement-info">
            <div class="achievement-name">{key}</div>
            <div class="achievement-desc">
              {ach.unlocked ? 'Unlocked!' : 'Locked'}
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <div class="shop-panel" class:active={activeTab === 'garden'}>
    {#if !gardenUnlocked}
      <div class="garden-unlock">
        <p>🔒 Unlock the Cookie Garden at 1,000 cookies</p>
      </div>
    {:else}
      <div class="garden-content">
        <p>Click plots to plant cookie seeds!</p>
        <p>Seeds: {gameData.garden.seeds}</p>
        <div class="garden-grid">
          {#each gameData.garden.plots as plot, i}
            <button
              class="garden-plot"
              class:planted={plot !== null}
              onclick={() => {
                import('$lib/stores/game').then(({ plantPlot, harvestPlot }) => {
                  if (plot === null && gameData.garden.seeds > 0) {
                    plantPlot(i);
                  } else if (plot && plot !== '🌱') {
                    const rewards: Record<string, number> = {
                      '🍪': 100,
                      '🍩': 500,
                      '🥠': 1000,
                      '⭐': 5000,
                    };
                    harvestPlot(i, rewards[plot] || 100);
                  }
                });
              }}
            >
              {plot ?? (gameData.garden.seeds > 0 ? '🌱' : '')}
            </button>
          {/each}
        </div>
      </div>
    {/if}
  </div>

  <div class="shop-panel" class:active={activeTab === 'prestige'}>
    <div class="prestige-upgrades">
      <p>Heavenly Chips: {formatNumber(gameData.heavenlyChips)}</p>
      {#each Object.entries(PRESTIGE_UPGRADES) as [key, upgrade]}
        {@const purchased = gameData.prestigeUpgrades[key]?.purchased ?? false}
        {@const cost = upgrade.cost}
        {@const affordable = gameData.heavenlyChips >= cost && !purchased}
        <button
          class="prestige-upgrade"
          class:affordable
          class:purchased
          onclick={() => {
            if (!purchased) {
              import('$lib/stores/game').then(({ buyPrestigeUpgrade }) => buyPrestigeUpgrade(key));
            }
          }}
          disabled={purchased}
        >
          <div class="upgrade-info">
            <div class="upgrade-name">{upgrade.name}</div>
            <div class="upgrade-desc">{upgrade.desc}</div>
          </div>
          <div class="upgrade-cost">{purchased ? '✓' : cost + ' 💎'}</div>
        </button>
      {/each}
    </div>
  </div>
</section>

<style>
  #shop {
    width: 100%;
    max-width: 400px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.18);
    backdrop-filter: blur(20px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 40px rgba(79, 70, 229, 0.1);
    transition: all 0.3s ease;
  }

  #shop:hover {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 60px rgba(79, 70, 229, 0.2);
  }

  h2 {
    text-align: center;
    margin-bottom: 15px;
    color: #ffffff;
    font-family: 'Fredoka', sans-serif;
    font-size: 1.8rem;
    text-shadow: 0 0 10px rgba(79, 70, 229, 0.5);
  }

  .shop-tabs {
    display: flex;
    gap: 5px;
    margin-bottom: 15px;
  }

  .shop-tab {
    flex: 1;
    padding: 10px;
    background: rgba(79, 70, 229, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 10px;
    cursor: pointer;
    font-weight: bold;
    font-family: 'Nunito', sans-serif;
    color: #E0E7FF;
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    backdrop-filter: blur(5px);
  }

  .shop-tab:hover {
    background: rgba(99, 102, 241, 0.25);
    transform: translateY(-2px);
  }

  .shop-tab.active {
    background: linear-gradient(135deg, #4F46E5, #6366F1);
    color: white;
    box-shadow: 0 0 15px rgba(79, 70, 229, 0.5);
    border-color: #6366F1;
  }

  .shop-panel {
    display: none;
  }

  .shop-panel.active {
    display: block;
  }

  .upgrade {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px;
    margin-bottom: 10px;
    background: rgba(79, 70, 229, 0.15);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    border: 1px solid transparent;
    backdrop-filter: blur(5px);
    width: 100%;
  }

  .upgrade:hover {
    background: rgba(99, 102, 241, 0.25);
    transform: translateX(5px);
    border-color: rgba(255, 255, 255, 0.18);
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
  }

  .upgrade.affordable {
    border-color: #10B981;
    background: rgba(16, 185, 129, 0.3);
    box-shadow: 0 0 15px rgba(16, 185, 129, 0.3);
  }

  .upgrade:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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
    color: #ffffff;
    font-family: 'Fredoka', sans-serif;
  }

  .cost {
    color: #F97316;
    font-size: 0.9rem;
    font-weight: 600;
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
    color: #6366F1;
    text-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
  }

  /* Achievements */
  .achievement {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    margin-bottom: 8px;
    background: rgba(79, 70, 229, 0.15);
    border-radius: 10px;
    opacity: 0.5;
    border: 1px solid transparent;
    transition: all 0.3s ease;
  }

  .achievement.unlocked {
    opacity: 1;
    background: linear-gradient(
      135deg,
      rgba(252, 211, 77, 0.3),
      rgba(251, 146, 60, 0.3)
    );
    color: #ffffff;
    border-color: #FCD34D;
    box-shadow: 0 0 15px rgba(252, 211, 77, 0.3);
  }

  .achievement-icon {
    font-size: 1.5rem;
  }

  .achievement-info {
    flex: 1;
  }

  .achievement-name {
    font-weight: bold;
    font-family: 'Fredoka', sans-serif;
  }

  .achievement-desc {
    font-size: 0.85rem;
    color: #A5B4FC;
  }

  /* Garden */
  .garden-unlock {
    text-align: center;
    padding: 20px;
  }

  .garden-content {
    text-align: center;
  }

  .garden-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    margin-top: 10px;
  }

  .garden-plot {
    aspect-ratio: 1;
    background: rgba(79, 70, 229, 0.15);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    border: 1px solid transparent;
    padding: 0;
  }

  .garden-plot:hover {
    border-color: #6366F1;
    box-shadow: 0 0 15px rgba(99, 102, 241, 0.3);
    transform: scale(1.05);
  }

  .garden-plot.planted {
    background: rgba(16, 185, 129, 0.3);
    border-color: #10B981;
  }

  /* Prestige */
  .prestige-upgrades {
    color: #ffffff;
  }

  .prestige-upgrade {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px;
    margin-bottom: 10px;
    background: linear-gradient(
      135deg,
      rgba(76, 29, 149, 0.4),
      rgba(99, 102, 241, 0.3)
    );
    color: #ffffff;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    border: 1px solid transparent;
    backdrop-filter: blur(5px);
    width: 100%;
  }

  .prestige-upgrade.affordable {
    border-color: #FCD34D;
    box-shadow: 0 0 20px rgba(252, 211, 77, 0.3);
  }

  .prestige-upgrade.purchased {
    opacity: 0.5;
    cursor: default;
    background: rgba(100, 100, 100, 0.2);
  }

  .prestige-upgrade:hover:not(.purchased) {
    transform: scale(1.02);
    box-shadow: 0 0 30px rgba(147, 112, 219, 0.5);
  }
</style>