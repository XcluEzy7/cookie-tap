<script lang="ts">
  import { milestoneBanner } from '$lib/runtime/ui-notifications';

  let banner = $derived($milestoneBanner);
</script>

{#if banner.visible}
  <div class="milestone-banner show">
    <h2>{banner.title}</h2>
    <p>{banner.message}</p>
  </div>
{/if}

<style>
  .milestone-banner {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
    background: linear-gradient(135deg, #4F46E5, #6366F1);
    color: #ffffff;
    padding: 40px 60px;
    border-radius: 20px;
    text-align: center;
    z-index: 3000;
    box-shadow: 0 0 60px rgba(79, 70, 229, 0.8), 0 10px 40px rgba(0, 0, 0, 0.5);
    transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    border: 1px solid rgba(255, 255, 255, 0.18);
    backdrop-filter: blur(10px);
  }

  .milestone-banner.show {
    transform: translate(-50%, -50%) scale(1);
  }

  .milestone-banner h2 {
    font-size: 2.5rem;
    margin-bottom: 10px;
    font-family: 'Fredoka', sans-serif;
  }

  .milestone-banner p {
    font-size: 1.3rem;
  }
</style>