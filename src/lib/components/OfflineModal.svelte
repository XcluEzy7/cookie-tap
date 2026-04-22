<script lang="ts">
  import { modals, formatNumber } from '$lib/stores/game';

  let modalData = $derived($modals);
  
  function close() {
    modals.update((m) => ({
      ...m,
      offline: { show: false, cookies: 0 },
    }));
  }
</script>

{#if modalData.offline.show}
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <div class="modal" onclick={close}>
    <div class="modal-content" onclick={(e) => e.stopPropagation()}>
      <h2>🌙 While You Were Away...</h2>
      <p>Your cookie empire continued to grow!</p>
      <div class="offline-cookies">{formatNumber(modalData.offline.cookies)}</div>
      <p>cookies were baked while offline</p>
      <button onclick={close}>Continue</button>
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

  .offline-cookies {
    font-size: 2rem;
    color: #FCD34D;
    margin: 20px 0;
    text-shadow: 0 0 20px rgba(252, 211, 77, 0.5);
    font-family: 'Fredoka', sans-serif;
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