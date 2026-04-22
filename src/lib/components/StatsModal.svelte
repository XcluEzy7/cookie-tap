<script lang="ts">
  import { gameState, formatNumber } from '$lib/stores/game';
  import { onMount } from 'svelte';

  $: state = $gameState;
  $: show = $state(false);

  $: playTime = $state(0);

  export function open() {
    show = true;
    updatePlayTime();
  }

  export function close() {
    show = false;
  }

  function updatePlayTime() {
    const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
    playTime = elapsed;
  }

  $: hours = Math.floor(playTime / 3600);
  $: minutes = Math.floor((playTime % 3600) / 60);

  $: unlockedCount = Object.values(state.achievements).filter((a) => a.unlocked).length;
  $: totalCount = Object.keys(state.achievements).length;
</script>

{#if show}
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <div class="modal" onclick={close}>
    <div class="modal-content" onclick={(e) => e.stopPropagation()}>
      <h2>📊 Statistics</h2>

      <div class="stat-row">
        <strong>Total Cookies Baked (All Time):</strong>
        {formatNumber(state.totalCookiesAllTime)}
      </div>
      <div class="stat-row">
        <strong>Session Cookies:</strong>
        {formatNumber(state.totalCookies)}
      </div>
      <div class="stat-row">
        <strong>Total Clicks:</strong>
        {formatNumber(state.clicks)}
      </div>
      <div class="stat-row">
        <strong>Golden Cookies Clicked:</strong>
        {state.goldenCookiesClicked}
      </div>
      <div class="stat-row">
        <strong>Prestige Resets:</strong>
        {state.prestigeCount}
      </div>
      <div class="stat-row">
        <strong>Heavenly Chips Earned:</strong>
        {state.totalHeavenlyChips}
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