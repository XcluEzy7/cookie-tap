<script lang="ts">
  import { gameState, clickPower } from '$lib/stores/game';
  import { formatNumber } from '$lib/game/engine';

  let floatingTexts: { id: number; text: string; x: number; y: number }[] = [];
  let nextId = 0;
  let cookieRef: HTMLDivElement;
  let wobble = false;

  $: currentClickPower = $clickPower;

  function handleClick(event: MouseEvent | TouchEvent) {
    // Import clickCookie from store dynamically
    import('$lib/stores/game').then(({ clickCookie }) => clickCookie());

    // Visual effects
    wobble = true;
    setTimeout(() => (wobble = false), 300);

    // Floating text
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    const rect = cookieRef.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const offsetY = clientY - rect.top;

    const id = nextId++;
    floatingTexts = [...floatingTexts, { id, text: '+' + formatNumber(currentClickPower), x: offsetX, y: offsetY }];
    setTimeout(() => {
      floatingTexts = floatingTexts.filter((t) => t.id !== id);
    }, 1000);
  }
</script>

<div id="cookie-section">
  <div
    class="cookie"
    class:wobble
    bind:this={cookieRef}
    onclick={handleClick}
    onkeydown={(e) => e.key === 'Enter' && handleClick(e as unknown as MouseEvent)}
    role="button"
    tabindex="0"
  >
    🍪
  </div>
  <div id="floating-text-container">
    {#each floatingTexts as ft (ft.id)}
      <div class="floating-text" style="left: {ft.x}px; top: {ft.y}px;">
        {ft.text}
      </div>
    {/each}
  </div>
  <p>Click Power: {formatNumber(currentClickPower)}</p>
</div>

<style>
  #cookie-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    max-width: 400px;
    text-align: center;
    margin-bottom: 30px;
  }

  .cookie {
    font-size: 200px;
    cursor: pointer;
    user-select: none;
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    filter: drop-shadow(0 0 30px rgba(79, 70, 229, 0.8));
    position: relative;
    z-index: 1;
    animation: float 4s ease-in-out infinite;
  }

  .cookie:hover {
    transform: scale(1.1);
    filter: drop-shadow(0 0 50px rgba(79, 70, 229, 0.8))
      drop-shadow(0 0 80px rgba(249, 115, 22, 0.6));
  }

  .cookie:active {
    transform: scale(0.95);
  }

  .cookie.wobble {
    animation: wobble 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55), float 4s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    25% { transform: translateY(-10px) rotate(2deg); }
    50% { transform: translateY(-5px) rotate(0deg); }
    75% { transform: translateY(-15px) rotate(-2deg); }
  }

  @keyframes wobble {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-5deg); }
    75% { transform: rotate(5deg); }
  }

  #floating-text-container {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    pointer-events: none;
  }

  .floating-text {
    position: absolute;
    font-size: 24px;
    font-weight: bold;
    color: #FCD34D;
    text-shadow: 0 0 10px rgba(252, 211, 77, 0.8);
    animation: float-up 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
    pointer-events: none;
    white-space: nowrap;
    font-family: 'Fredoka', sans-serif;
  }

  @keyframes float-up {
    0% { opacity: 1; transform: translateY(0) scale(1); }
    100% { opacity: 0; transform: translateY(-100px) scale(1.5); }
  }
</style>