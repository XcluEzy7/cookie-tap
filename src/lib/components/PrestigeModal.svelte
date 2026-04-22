<script lang="ts">
  import { gameState, doPrestige, getPrestigeInfo } from '$lib/stores/game';

  $: state = $gameState;
  $: prestigeInfo = getPrestigeInfo();

  export function open() {
    show = true;
  }

  let show = $state(false);

  export function close() {
    show = false;
  }

  function handleAscend() {
    doPrestige();
    close();
  }
</script>

{#if show}
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <div class="modal" onclick={close}>
    <div class="modal-content" onclick={(e) => e.stopPropagation()}>
      <h2>✨ Ascension</h2>
      <p>Reset your progress to gain Heavenly Chips and permanent bonuses!</p>
      <div class="chips-display">
        <p>
          You'll gain:
          <span class="chips-count">{prestigeInfo.potentialGain}</span>
          Heavenly Chips
        </p>
        <p class="hint">Each chip gives +2% CPS permanently</p>
      </div>
      <button onclick={handleAscend}>Ascend</button>
      <button class="secondary" onclick={close}>Cancel</button>
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
    text-align: center;
  }

  .modal-content h2 {
    margin-bottom: 20px;
    font-family: 'Fredoka', sans-serif;
    color: #ffffff;
    text-shadow: 0 0 10px rgba(79, 70, 229, 0.5);
  }

  .chips-display {
    margin: 20px 0;
  }

  .chips-count {
    font-size: 2rem;
    color: #A78BFA;
    font-weight: bold;
    text-shadow: 0 0 10px rgba(167, 139, 250, 0.5);
  }

  .hint {
    font-size: 0.9rem;
    color: #A5B4FC;
  }

  .modal-content button {
    width: 100%;
    margin-top: 15px;
    padding: 12px 24px;
    border: none;
    border-radius: 25px;
    background: linear-gradient(135deg, #9333EA, #A78BFA);
    color: #ffffff;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 0 20px rgba(147, 51, 234, 0.5);
  }

  .modal-content button:hover {
    transform: translateY(-3px);
    box-shadow: 0 0 30px rgba(147, 51, 234, 0.7);
  }

  .modal-content button.secondary {
    background: linear-gradient(135deg, #4F46E5, #6366F1);
    box-shadow: 0 0 20px rgba(79, 70, 229, 0.4);
  }
</style>