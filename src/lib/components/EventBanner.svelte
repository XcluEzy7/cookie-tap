<script lang="ts">
  let { name = '', description = '' }: { name?: string; description?: string } = $props();

  let show = false;
  let timeout: ReturnType<typeof setTimeout>;

  export function display(newName: string, newDesc: string) {
    name = newName;
    description = newDesc;
    show = true;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      show = false;
    }, 5000);
  }
</script>

{#if show}
  <div class="event-banner" class:show>
    <strong>{name}</strong>: {description}
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