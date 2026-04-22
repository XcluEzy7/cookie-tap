<script lang="ts">
  import { achievementNotification } from '$lib/runtime/ui-notifications';

  let notification = $derived($achievementNotification);
</script>

{#if notification.visible}
  <div class="achievement-popup show">
    <h4>🏆 Achievement Unlocked!</h4>
    <p>{notification.title}: {notification.message}</p>
  </div>
{/if}

<style>
  .achievement-popup {
    position: fixed;
    top: 20px;
    right: -400px;
    background: linear-gradient(135deg, #4F46E5, #6366F1);
    color: #ffffff;
    padding: 15px 20px;
    border-radius: 15px;
    box-shadow: 0 0 30px rgba(79, 70, 229, 0.6), 0 4px 15px rgba(0, 0, 0, 0.3);
    z-index: 2000;
    transition: right 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    max-width: 350px;
    border: 1px solid rgba(255, 255, 255, 0.18);
    backdrop-filter: blur(10px);
  }

  .achievement-popup.show {
    right: 20px;
  }

  .achievement-popup h4 {
    margin-bottom: 5px;
    font-size: 1.1rem;
    font-family: 'Fredoka', sans-serif;
    font-weight: 600;
  }

  .achievement-popup p {
    font-size: 0.9rem;
    margin: 0;
    opacity: 0.9;
  }
</style>