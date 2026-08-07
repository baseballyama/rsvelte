<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { themeStore } from '$lib/theme.svelte';

	type Active = 'home' | 'docs' | 'playground' | 'progress' | 'benchmark';

	interface Props {
		active?: Active;
	}

	let { active }: Props = $props();
	let menuOpen = $state(false);

	const isActive = (slug: Active): boolean => {
		if (active) return active === slug;
		const path = page.url.pathname;
		const root = `${base}/`;
		if (slug === 'home') return path === root || path === base;
		return path.startsWith(`${base}/${slug}`);
	};

	const current = $derived(themeStore.current);
</script>

<header class="site-header">
	<nav class="nav" aria-label="Main navigation">
		<a href="{base}/" class="brand" aria-label="rsvelte home">
			<span class="mark" aria-hidden="true">
				<svg viewBox="0 0 24 24" width="20" height="20" fill="none">
					<path d="M19 8 13 18l-2-4 6-10 2 4Z" fill="var(--svelte)" />
					<path d="M5 16 11 6l2 4-6 10-2-4Z" fill="var(--rust)" />
				</svg>
			</span>
			<span>rsvelte</span>
		</a>

		<button
			type="button"
			class="menu-toggle"
			aria-label="Toggle navigation"
			aria-expanded={menuOpen}
			onclick={() => (menuOpen = !menuOpen)}
		>
			<span></span><span></span><span></span>
		</button>

		<div class="links" class:open={menuOpen}>
			<a href="{base}/docs" class:active={isActive('docs')} onclick={() => (menuOpen = false)}>Docs</a>
			<a
				href="{base}/playground"
				class:active={isActive('playground')}
				onclick={() => (menuOpen = false)}>Playground</a
			>
			<a
				href="{base}/progress"
				class:active={isActive('progress')}
				onclick={() => (menuOpen = false)}>Compatibility</a
			>
			<a
				href="{base}/benchmark"
				class:active={isActive('benchmark')}
				onclick={() => (menuOpen = false)}>Benchmark</a
			>
			<a
				class="external-link"
				href="https://github.com/baseballyama/rsvelte"
				target="_blank"
				rel="noopener noreferrer"
				aria-label="GitHub (opens in a new tab)"
				onclick={() => (menuOpen = false)}
			>
				<span>GitHub</span>
				<svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
					<path d="M9 2.5h4.5V7M13 3 7.5 8.5" />
					<path d="M11.5 8.5v3a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h3" />
				</svg>
			</a>
			<button
				type="button"
				class="theme-toggle"
				aria-label="Toggle dark mode"
				aria-pressed={current === 'dark'}
				title="{current === 'dark' ? 'Switch to light' : 'Switch to dark'} mode"
				onclick={() => themeStore.toggle()}
			>
				{#if current === 'dark'}
					<svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
						<circle cx="12" cy="12" r="3.5" fill="currentColor" />
						<path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
					</svg>
				{:else}
					<svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
						<path d="M20 14.5A8 8 0 0 1 9.5 4a7.5 7.5 0 1 0 10.5 10.5Z" fill="currentColor" />
					</svg>
				{/if}
			</button>
		</div>
	</nav>
</header>

<style>
	.site-header {
		position: sticky;
		top: 0;
		z-index: 50;
		background: color-mix(in srgb, var(--bg) 94%, transparent);
		border-bottom: 1px solid var(--rule);
		backdrop-filter: blur(10px);
	}

	.nav {
		height: 60px;
		max-width: 1180px;
		margin: 0 auto;
		padding: 0 1.5rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 2rem;
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		font-size: 1rem;
		font-weight: 650;
		letter-spacing: -0.015em;
		color: var(--ink);
	}

	.mark {
		--svelte: #ff3e00;
		--rust: #5c6773;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
	}

	:global(:root[data-theme='dark']) .mark {
		--svelte: #ff6a39;
		--rust: #8b96a2;
	}

	.links {
		height: 100%;
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.links a,
	.theme-toggle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		height: 34px;
		padding: 0 0.75rem;
		border-radius: 6px;
		font-size: 0.86rem;
		font-weight: 500;
		color: var(--ink-soft);
	}

	.links a:hover,
	.links a.active,
	.theme-toggle:hover {
		background: var(--paper);
		color: var(--ink);
	}

	.links a.active {
		font-weight: 600;
	}

	.links .external-link {
		gap: 0.35rem;
	}

	.external-link svg {
		flex: none;
		stroke: currentColor;
		stroke-width: 1.35;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.theme-toggle,
	.menu-toggle {
		border: 0;
		background: transparent;
		cursor: pointer;
	}

	.theme-toggle {
		width: 34px;
		padding: 0;
		margin-left: 0.25rem;
	}

	.menu-toggle {
		display: none;
		width: 36px;
		height: 36px;
		padding: 8px;
		color: var(--ink-soft);
	}

	.menu-toggle span {
		display: block;
		height: 1px;
		margin: 4px 0;
		background: currentColor;
	}

	@media (max-width: 820px) {
		.nav {
			padding-inline: 1rem;
		}

		.menu-toggle {
			display: block;
		}

		.links {
			display: none;
			position: absolute;
			top: 60px;
			left: 0;
			right: 0;
			height: auto;
			padding: 0.75rem 1rem 1rem;
			background: var(--bg);
			border-bottom: 1px solid var(--rule);
			flex-direction: column;
			align-items: stretch;
		}

		.links.open {
			display: flex;
		}

		.links a,
		.theme-toggle {
			justify-content: flex-start;
			width: 100%;
			height: 42px;
			padding: 0 0.75rem;
		}

		.theme-toggle {
			margin: 0;
		}
	}
</style>
