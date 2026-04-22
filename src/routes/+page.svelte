<script lang="ts">
  // Main game page - composite of parity components
  // This is the live route that exposes the full UI surface

  import Header from '$lib/components/Header.svelte';
  import NewsTicker from '$lib/components/NewsTicker.svelte';
  import CookieButton from '$lib/components/CookieButton.svelte';
  import Shop from '$lib/components/Shop.svelte';
  import Footer from '$lib/components/Footer.svelte';
  
  // Banner and popup components
  import GoldenCookie from '$lib/components/GoldenCookie.svelte';
  import AchievementPopup from '$lib/components/AchievementPopup.svelte';
  import EventBanner from '$lib/components/EventBanner.svelte';
  import MilestoneBanner from '$lib/components/MilestoneBanner.svelte';
  import PrestigeBanner from '$lib/components/PrestigeBanner.svelte';
  
  // Modal components
  import SettingsModal from '$lib/components/SettingsModal.svelte';
  import StatsModal from '$lib/components/StatsModal.svelte';
  import PrestigeModal from '$lib/components/PrestigeModal.svelte';
</script>

<svelte:head>
  <title>Cookie Clicker - Enhanced Edition</title>
</svelte:head>

<div id="game-container">
  <NewsTicker />
  <Header />
  
  <main id="main-content">
    <div id="left-panel">
      <CookieButton />
    </div>
    <div id="right-panel">
      <Shop />
    </div>
  </main>
  
  <Footer />
</div>

<!-- Floating/boundary components -->
<GoldenCookie />
<AchievementPopup />
<EventBanner />
<MilestoneBanner />
<PrestigeBanner />

<!-- Modal components (rendered on-demand via modals store) -->
<SettingsModal />
<StatsModal />
<PrestigeModal />

<style>
  :global(body) {
    font-family: 'Nunito', sans-serif;
    background: linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #1E1B4B 100%);
    color: #E0E7FF;
    min-height: 100vh;
    margin: 0;
  }

  :global(h1, h2) {
    font-family: 'Fredoka', sans-serif;
  }

  #game-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    max-width: 900px;
    margin: 0 auto;
    padding: 0 20px;
  }

  #main-content {
    flex: 1;
    display: flex;
    gap: 30px;
    padding: 20px 0;
    align-items: flex-start;
  }

  #left-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  #right-panel {
    width: 420px;
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    #main-content {
      flex-direction: column;
    }

    #right-panel {
      width: 100%;
    }
  }
</style>