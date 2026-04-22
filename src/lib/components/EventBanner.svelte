<script lang="ts">
  import { eventBanner } from '$lib/runtime/ui-notifications';

  let banner = $derived($eventBanner);
</script>

{#if banner.visible}
  <div class="event-banner show">
    <strong>{banner.title}</strong>: {banner.message}
  </div>
{/if}

<style>
  .event-banner {
    position: fixed;
    top: 60px;
    left: 50%;
    transform: translateX(-50%) scale(0);
    background: linear-gradient(135deg, #F97316, #DC2626);
    color: white;
    padding: 15px 30px;
    border-radius: 25px;
    font-size: 1.2rem;
    font-weight: bold;
    z-index: 1500;
    box-shadow: 0 0 40px rgba(249, 115, 22, 0.6);
    transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    text-align: center;
    border: 1px solid rgba(255, 255, 255, 0.18);
    backdrop-filter: blur(10px);
  }

  .event-banner.show {
    transform: translateX(-50%) scale(1);
  }
</style>