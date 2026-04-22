<script lang="ts">
  import { gameState, showSettingsModal, showStatsModal, showPrestigeModal, getPrestigeInfo } from '$lib/stores/game';
  import { installPromptReady, showInstallPrompt } from '$lib/client-runtime';

  let gameData = $derived($gameState);
  let prestigeInfo = $derived(getPrestigeInfo());
  let installReady = $derived($installPromptReady);

  async function handleInstall() {
    const outcome = await showInstallPrompt();
    // Store auto-updates via installPromptReady, no need to manually set
  }
</script>

<footer>
  <button onclick={() => showSettingsModal()}>⚙️ Settings</button>
  <button onclick={() => showStatsModal()}>📊 Stats</button>
  {#if prestigeInfo.potentialGain > 0}
    <button
      id="prestige-btn"
      class="available"
      onclick={() => showPrestigeModal()}
    >
      ✨ Ascension
    </button>
  {/if}
  {#if installReady}
    <button onclick={handleInstall}>📱 Install App</button>
  {/if}
</footer>

<style>
  footer {
    display: flex;
    justify-content: center;
    gap: 20px;
    padding: 20px;
    background: rgba(79, 70, 229, 0.2);
    flex-wrap: wrap;
    border-top: 1px solid rgba(255, 255, 255, 0.18);
    backdrop-filter: blur(10px);
  }

  button {
    padding: 12px 24px;
    border: none;
    border-radius: 25px;
    background: linear-gradient(135deg, #4F46E5, #6366F1);
    color: #ffffff;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    box-shadow: 0 0 20px rgba(79, 70, 229, 0.4);
    font-family: 'Nunito', sans-serif;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  button:hover {
    transform: translateY(-3px);
    box-shadow: 0 0 30px rgba(79, 70, 229, 0.7), 0 0 50px rgba(249, 115, 22, 0.3);
    background: linear-gradient(135deg, #6366F1, #4F46E5);
  }

  #prestige-btn {
    display: none;
  }

  #prestige-btn.available {
    display: inline-block;
    background: linear-gradient(135deg, #9333EA, #A78BFA);
    box-shadow: 0 0 20px rgba(147, 51, 234, 0.5);
  }

  #prestige-btn.available:hover {
    box-shadow: 0 0 30px rgba(147, 51, 234, 0.7), 0 0 50px rgba(251, 146, 60, 0.3);
  }
</style>