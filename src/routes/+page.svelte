<script lang="ts">
	import { base } from '$app/paths';

	// Game state
	let cookies = $state(0);
	let totalCookies = $state(0);
	let clicks = $state(0);
	let clickPower = $state(1);
	let cps = $state(0);

	// Buildings
	interface Building {
		owned: number;
		baseCost: number;
		baseCps: number;
		name: string;
		icon: string;
	}

	let buildings = $state<Record<string, Building>>({
		cursor: { owned: 0, baseCost: 15, baseCps: 0.1, name: 'Cursor', icon: '🖱️' },
		grandma: { owned: 0, baseCost: 100, baseCps: 1, name: 'Grandma', icon: '👵' },
		farm: { owned: 0, baseCost: 1100, baseCps: 8, name: 'Farm', icon: '🚜' },
		mine: { owned: 0, baseCost: 12000, baseCps: 47, name: 'Mine', icon: '⛏️' },
		factory: { owned: 0, baseCost: 130000, baseCps: 260, name: 'Factory', icon: '🏭' },
		bank: { owned: 0, baseCost: 1400000, baseCps: 1400, name: 'Bank', icon: '🏦' },
		temple: { owned: 0, baseCost: 20000000, baseCps: 7800, name: 'Temple', icon: '🏛️' },
		wizard: { owned: 0, baseCost: 330000000, baseCps: 44000, name: 'Wizard Tower', icon: '🧙' }
	});

	// Calculate total CPS
	function getTotalCps(): number {
		let total = 0;
		for (const key in buildings) {
			total += buildings[key].owned * buildings[key].baseCps;
		}
		return total;
	}

	// Calculate upgrade cost
	function getUpgradeCost(key: string): number {
		const building = buildings[key];
		return Math.floor(building.baseCost * Math.pow(1.15, building.owned));
	}

	// Format number with suffixes
	function formatNumber(num: number): string {
		const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
		if (num < 1000) return Math.floor(num).toString();
		const exp = Math.floor(Math.log10(num) / 3);
		const suffix = suffixes[Math.min(exp, suffixes.length - 1)];
		return (num / Math.pow(1000, exp)).toFixed(2) + suffix;
	}

	// Click cookie
	function clickCookie(): void {
		cookies += clickPower;
		totalCookies += clickPower;
		clicks++;
	}

	// Buy building
	function buyBuilding(key: string): void {
		const cost = getUpgradeCost(key);
		if (cookies >= cost) {
			cookies -= cost;
			buildings[key].owned++;
			cps = getTotalCps();
		}
	}

	// Auto-save to localStorage
	function saveGame(): void {
		const saveData = {
			cookies,
			totalCookies,
			clicks,
			clickPower,
			buildings: Object.fromEntries(
				Object.entries(buildings).map(([k, v]) => [k, { owned: v.owned }])
			),
			lastSave: Date.now()
		};
		localStorage.setItem('cookieClickerSave', JSON.stringify(saveData));
	}

	// Load from localStorage
	function loadGame(): void {
		try {
			const save = localStorage.getItem('cookieClickerSave');
			if (save) {
				const parsed = JSON.parse(save);
				cookies = parsed.cookies ?? 0;
				totalCookies = parsed.totalCookies ?? 0;
				clicks = parsed.clicks ?? 0;
				clickPower = parsed.clickPower ?? 1;
				if (parsed.buildings) {
					for (const key in parsed.buildings) {
						if (buildings[key]) {
							buildings[key].owned = parsed.buildings[key].owned ?? 0;
						}
					}
				}
				cps = getTotalCps();
			}
		} catch (e) {
			console.warn('Could not load save:', e);
		}
	}

	// Game loop
	$effect(() => {
		const interval = setInterval(() => {
			const tickCps = getTotalCps() / 10;
			cookies += tickCps;
			totalCookies += tickCps;
		}, 100);

		const saveInterval = setInterval(saveGame, 5000);

		return () => {
			clearInterval(interval);
			clearInterval(saveInterval);
		};
	});

	// Load game on mount
	$effect(() => {
		loadGame();
	});

	// PWA install prompt
	let deferredPrompt: BeforeInstallPromptEvent | null = $state(null);
	let showInstall = $state(false);

	interface BeforeInstallPromptEvent extends Event {
		prompt(): Promise<void>;
		userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
	}

	$effect(() => {
		const handler = (e: Event) => {
			e.preventDefault();
			deferredPrompt = e as BeforeInstallPromptEvent;
			showInstall = true;
		};
		window.addEventListener('beforeinstallprompt', handler);
		return () => window.removeEventListener('beforeinstallprompt', handler);
	});

	async function installPwa(): Promise<void> {
		if (deferredPrompt) {
			deferredPrompt.prompt();
			const { outcome } = await deferredPrompt.userChoice;
			if (outcome === 'accepted') {
				showInstall = false;
			}
			deferredPrompt = null;
		}
	}
</script>

<svelte:head>
	<title>Cookie Clicker - Enhanced Edition</title>
</svelte:head>

<main>
	<header>
		<h1>🍪 Cookie Clicker - Enhanced Edition</h1>
		<div class="stats">
			<div class="stat">Cookies: <span>{formatNumber(Math.floor(cookies))}</span></div>
			<div class="stat">Per second: <span>{formatNumber(cps)}</span></div>
			<div class="stat">Clicks: <span>{formatNumber(clicks)}</span></div>
		</div>
	</header>

	<section class="cookie-section">
		<div class="cookie" onclick={clickCookie} role="button" tabindex="0"
			onkeydown={(e) => e.key === 'Enter' && clickCookie()}>
			🍪
		</div>
		<p>Click Power: {clickPower}</p>
	</section>

	<section class="shop">
		<h2>Shop</h2>
		{#each Object.entries(buildings) as [key, building]}
			<button
				class="upgrade"
				class:affordable={cookies >= getUpgradeCost(key)}
				onclick={() => buyBuilding(key)}
			>
				<span class="icon">{building.icon}</span>
				<div class="info">
					<div class="name">{building.name}</div>
					<div class="cost">Cost: {formatNumber(getUpgradeCost(key))} cookies</div>
					<div class="cps">+{formatNumber(building.baseCps)} CPS</div>
				</div>
				<span class="owned">{building.owned}</span>
			</button>
		{/each}
	</section>

	<footer>
		{#if showInstall}
			<button onclick={installPwa}>📱 Install App</button>
		{/if}
	</footer>
</main>

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

	main {
		max-width: 800px;
		margin: 0 auto;
		padding: 20px;
	}

	header {
		text-align: center;
		padding: 20px;
		background: linear-gradient(135deg, rgba(79, 70, 229, 0.4), rgba(55, 48, 163, 0.5));
		border-radius: 20px;
		margin-bottom: 20px;
	}

	h1 {
		font-size: 2rem;
		margin-bottom: 10px;
	}

	.stats {
		display: flex;
		justify-content: center;
		gap: 15px;
		flex-wrap: wrap;
	}

	.stat {
		background: rgba(255, 255, 255, 0.1);
		padding: 8px 16px;
		border-radius: 20px;
	}

	.cookie-section {
		text-align: center;
		margin-bottom: 30px;
	}

	.cookie {
		font-size: 150px;
		cursor: pointer;
		user-select: none;
		transition: transform 0.1s;
		filter: drop-shadow(0 0 30px rgba(79, 70, 229, 0.8));
		display: inline-block;
	}

	.cookie:hover {
		transform: scale(1.1);
	}

	.cookie:active {
		transform: scale(0.95);
	}

	.shop {
		background: rgba(255, 255, 255, 0.08);
		border-radius: 20px;
		padding: 20px;
	}

	h2 {
		text-align: center;
		margin-bottom: 15px;
		color: white;
	}

	.upgrade {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 15px;
		margin-bottom: 10px;
		background: rgba(79, 70, 229, 0.15);
		border: 1px solid rgba(255, 255, 255, 0.18);
		border-radius: 12px;
		cursor: pointer;
		transition: all 0.2s;
		color: inherit;
		font-family: inherit;
	}

	.upgrade:hover {
		background: rgba(99, 102, 241, 0.25);
		transform: translateX(5px);
	}

	.upgrade.affordable {
		border-color: #10B981;
		background: rgba(16, 185, 129, 0.3);
	}

	.icon {
		font-size: 2rem;
		margin-right: 10px;
	}

	.info {
		flex: 1;
		text-align: left;
	}

	.name {
		font-weight: bold;
		font-size: 1.1rem;
	}

	.cost {
		color: #F97316;
		font-size: 0.9rem;
	}

	.cps {
		font-size: 0.85rem;
		opacity: 0.8;
	}

	.owned {
		font-size: 1.5rem;
		font-weight: bold;
		min-width: 40px;
		text-align: center;
	}

	footer {
		text-align: center;
		padding: 20px;
	}

	footer button {
		padding: 12px 24px;
		border: none;
		border-radius: 25px;
		background: linear-gradient(135deg, #4F46E5, #6366F1);
		color: white;
		font-weight: bold;
		cursor: pointer;
		transition: transform 0.2s;
	}

	footer button:hover {
		transform: translateY(-3px);
	}
</style>