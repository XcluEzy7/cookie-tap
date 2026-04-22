<script lang="ts">
  import { gameState, modals, toggleSetting, resetGame } from '$lib/stores/game';

  let modalData = $derived($modals);

  function close() {
    modals.update((m) => ({ ...m, settings: false }));
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      close();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if modalData.settings}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions a11y_interactive_supports_focus -->
  <div class="modal" onclick={close} role="dialog" aria-modal="true" tabindex="-1">
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions a11y_no_noninteractive_element_interactions -->
    <div class="modal-content" onclick={(e) => e.stopPropagation()} role="presentation">
      <h2>⚙️ Settings</h2>

      <label>
        <input
          type="checkbox"
          checked={$gameState.settings.soundEnabled}
          onchange={() => toggleSetting('soundEnabled')}
        />
        Sound Effects
      </label>

      <label>
        <input
          type="checkbox"
          checked={$gameState.settings.particlesEnabled}
          onchange={() => toggleSetting('particlesEnabled')}
        />
        Particle Effects
      </label>

      <label>
        <input
          type="checkbox"
          checked={$gameState.settings.screenShakeEnabled}
          onchange={() => toggleSetting('screenShakeEnabled')}
        />
        Screen Shake
      </label>

      <label>
        <input
          type="checkbox"
          checked={$gameState.settings.darkMode}
          onchange={() => toggleSetting('darkMode')}
        />
        Dark Mode
      </label>

      <button id="reset-btn" onclick={() => resetGame()}>
        🔄 Reset Game
      </button>
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

  .modal-content label {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 15px;
    font-size: 1.1rem;
    cursor: pointer;
    padding: 10px;
    border-radius: 10px;
    transition: all 0.2s ease;
  }

  .modal-content label:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .modal-content input[type='checkbox'] {
    width: 20px;
    height: 20px;
    cursor: pointer;
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

  #reset-btn {
    background: linear-gradient(135deg, #DC2626, #EF4444);
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
  }

  #reset-btn:hover {
    box-shadow: 0 0 30px rgba(239, 68, 68, 0.6);
  }
</style>