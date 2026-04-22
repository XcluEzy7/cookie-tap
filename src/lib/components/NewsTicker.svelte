<script lang="ts">
  import { newsHeadline } from '$lib/runtime/ui-notifications';

  let headline = $derived($newsHeadline);
</script>

<div id="news-ticker">
  <span id="news-content">{headline}</span>
</div>

<style>
  #news-ticker {
    background: rgba(79, 70, 229, 0.3);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.18);
    color: #FCD34D;
    padding: 8px 0;
    overflow: hidden;
    white-space: nowrap;
    font-style: italic;
    font-size: 0.95rem;
    font-family: 'Nunito', sans-serif;
  }

  #news-content {
    display: inline-block;
    animation: ticker 30s linear infinite;
  }

  @keyframes ticker {
    0% { transform: translateX(100vw); }
    100% { transform: translateX(-100%); }
  }
</style>