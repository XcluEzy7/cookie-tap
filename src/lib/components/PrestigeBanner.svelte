<script lang="ts">
  import { gameState, getPrestigeInfo } from '$lib/stores/game';

  $: state = $gameState;
  $: prestigeInfo = getPrestigeInfo();

  const showPrestigeModal = () => {
    import('$lib/stores/game').then(({ showPrestigeModal }) => showPrestigeModal());
  };
</script>

{#if prestigeInfo.potentialGain > 0}
  <div id="prestige-section" class="available">
    <div>✨ Ascension Available! ✨</div>
    <div>
      You'll gain <strong>{prestigeInfo.potentialGain}</strong> Heavenly Chips
    </div>
    <button onclick={showPrestigeModal} style="margin-top: 10px;">Ascend Now</button>
  </div>
{/if}

<style>
  #prestige-section {
    background: linear-gradient(
      135deg,
      rgba(147, 112, 219, 0.3),
      rgba(79, 70, 229, 0.4)
    );
    color: #ffffff;
    padding: 15px;
    text-align: center;
    border-radius: 15px;
    margin: 10px 0;
    border: 1px solid rgba(255, 255, 255, 0.18);
    backdrop-filter: blur(10px);
    box-shadow: 0 0 20px rgba(147, 112, 219, 0.3);
  }

  #prestige-section strong {
    font-size: 1.5rem;
    color: #FCD34D;
    text-shadow: 0 0 10px rgba(252, 211, 77, 0.5);
  }

  #prestige-section button {
    background: linear-gradient(135deg, #9333EA, #A78BFA);
    box-shadow: 0 0 20px rgba(147, 51, 234, 0.5);
  }

  #prestige-section button:hover {
    box-shadow: 0 0 30px rgba(147, 51, 234, 0.7), 0 0 50px rgba(251, 146, 60, 0.3);
  }
</style>