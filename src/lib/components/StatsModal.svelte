<script lang="ts">
  import { gameState, modals, formatNumber } from '$lib/stores/game';

  let modalData = $derived($modals);
  let playTime = $state(0);

  $effect(() => {
    if (modalData.stats) {
      updatePlayTime();
    }
  });

  function updatePlayTime() {
    const elapsed = Math.floor((Date.now() - $gameState.startTime) / 1000);
    playTime = elapsed;
  }

  function close() {
    modals.update((m) => ({ ...m, stats: false }));
  }

  let hours = $derived(Math.floor(playTime / 3600));
  let minutes = $derived(Math.floor((playTime % 3600) / 60));
  let unlockedCount = $derived(Object.values($gameState.achievements).filter((a) => a.unlocked).length);
  let totalCount = $derived(Object.keys($gameState.achievements).length);

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      close();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if modalData.stats}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions a11y_interactive_supports_focus -->
  <div class="modal" onclick={close} role="dialog" aria-modal="true" tabindex="-1">
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions a11y_no_noninteractive_element_interactions -->
    <div class="modal-content" onclick={(e) => e.stopPropagation()} role="presentation">
      <h2>📊 Statistics</h2>

      <div class="stat-row">
        <strong>Total Cookies Baked (All Time):</strong>
        {formatNumber($gameState.totalCookiesAllTime)}
      </div>
      <div class="stat-row">
        <strong>Session Cookies:</strong>
        {formatNumber($gameState.totalCookies)}
      </div>
      <div class="stat-row">
        <strong>Total Clicks:</strong>
        {formatNumber($gameState.clicks)}
      </div>
      <div class="stat-row">
        <strong>Golden Cookies Clicked:</strong>
        {$gameState.goldenCookiesClicked}
      </div>
      <div class="stat-row">
        <strong>Prestige Resets:</strong>
        {$gameState.prestigeCount}
      </div>
      <div class="stat-row">
        <strong>Heavenly Chips Earned:</strong>
        {$gameState.totalHeavenlyChips}
      </div>
      <div class="stat-row">
        <strong>Play Time:</strong>
        {hours}h {minutes}m
      </div>
      <div class="stat-row">
        <strong>Achievements Unlocked:</strong>
        {unlockedCount}/{totalCount}
      </div>

      <button onclick={close}>Close</button>
    </div>
  </div>
{/if}

<style>
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    backdrop-filter: blur(5px);
  }

  .modal-content {
    background: rgba(255, 255, 255, 0.08);
    padding: 30px;
    border-radius: 20px;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    border: 1px solid rgba(255, 255, 255, 0.18);
    backdrop-filter: blur(20px);
    box-shadow: 0 0 60px rgba(79, 70, 229, 0.3), 0 10px 40px rgba(0, 0, 0, 0.5);
    color: #E0E7FF;
  }

  .modal-content h2 {
    margin-bottom: 20px;
    text-align: center;
    font-family: 'Fredoka', sans-serif;
    color: #ffffff;
    text-shadow: 0 0 10px rgba(79, 70, 229, 0.5);
  }

  .stat-row {
    margin-bottom: 15px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
  }

  .stat-row strong {
    color: #FCD34D;
  }

  .modal-content button {
    width: 100%;
    margin-top: 15px;
    padding: 12px 24px;
    border: none;
    border-radius: 25px;
    background: linear-gradient(135deg, #4F46E5, #6366F1);
    color: #ffffff;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .modal-content button:hover {
    transform: translateY(-3px);
    box-shadow: 0 0 30px rgba(79, 70, 229, 0.7);
  }
</style>