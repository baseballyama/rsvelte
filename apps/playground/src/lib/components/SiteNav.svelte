<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { themeStore } from '$lib/theme.svelte';

	type Active = 'home' | 'docs' | 'ecosystem' | 'playground' | 'progress' | 'benchmark';

	interface Props {
		// Each page passes its own slug so the link gets the `active` style
		// even when SvelteKit's `page.url` isn't reachable (e.g. during SSR
		// in some contexts).
		active?: Active;
	}

	let { active }: Props = $props();

	const isActive = (slug: Active): boolean => {
		if (active) return active === slug;
		const path = page.url.pathname;
		const root = `${base}/`;
		if (slug === 'home') return path === root || path === base;
		return path.startsWith(`${base}/${slug}`);
	};

	const current = $derived(themeStore.current);
</script>

<nav class="nav">
	<a href="{base}/" class="brand" aria-label="rsvelte home">
		<span class="mark" aria-hidden="true">
			<svg viewBox="0 0 24 24" width="20" height="20" fill="none">
				<path d="M19 8 13 18l-2-4 6-10 2 4Z" fill="var(--svelte)" />
				<path d="M5 16 11 6l2 4-6 10-2-4Z" fill="var(--rust)" />
			</svg>
		</span>
		<span class="brand-text">rsvelte</span>
		<span class="brand-tag">svelte&nbsp;·&nbsp;in&nbsp;rust</span>
	</a>

	<div class="links">
		<a href="{base}/docs" class:active={isActive('docs')}>Docs</a>
		<a href="{base}/ecosystem" class:active={isActive('ecosystem')}>Ecosystem</a>
		<a href="{base}/playground" class:active={isActive('playground')}>Playground</a>
		<a href="{base}/progress" class:active={isActive('progress')}>Compatibility</a>
		<a href="{base}/benchmark" class:active={isActive('benchmark')}>Benchmark</a>
		<a href="https://github.com/baseballyama/rsvelte" target="_blank" rel="noopener" class="gh">
			GitHub <span class="ext" aria-hidden="true">↗</span>
		</a>
		<button
			type="button"
			class="theme-toggle"
			aria-label="Toggle dark mode"
			aria-pressed={current === 'dark'}
			title="{current === 'dark' ? 'Switch to light' : 'Switch to dark'} mode"
			onclick={() => themeStore.toggle()}
		>
			<span class="theme-icon" aria-hidden="true">
				{#if current === 'dark'}
					<svg viewBox="0 0 24 24" width="16" height="16" fill="none">
						<circle cx="12" cy="12" r="4" fill="currentColor" />
						<g stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
							<path d="M12 3v2" />
							<path d="M12 19v2" />
							<path d="M3 12h2" />
							<path d="M19 12h2" />
							<path d="m5.6 5.6 1.4 1.4" />
							<path d="m17 17 1.4 1.4" />
							<path d="m5.6 18.4 1.4-1.4" />
							<path d="m17 7 1.4-1.4" />
						</g>
					</svg>
				{:else}
					<svg viewBox="0 0 24 24" width="16" height="16" fill="none">
						<path
							d="M20 14.5A8 8 0 0 1 9.5 4a7.5 7.5 0 1 0 10.5 10.5Z"
							fill="currentColor"
						/>
					</svg>
				{/if}
			</span>
		</button>
	</div>
</nav>

<style>
	.nav {
		position: sticky;
		top: 0;
		z-index: 30;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 2rem;
		padding: 0.9rem clamp(1rem, 4vw, 2.5rem);
		background: color-mix(in srgb, var(--bg) 88%, transparent);
		border-bottom: 1px solid var(--rule);
		backdrop-filter: saturate(150%) blur(6px);
		-webkit-backdrop-filter: saturate(150%) blur(6px);
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		color: var(--ink);
	}

	.mark {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
	}

	.brand-text {
		font-weight: 700;
		font-size: 1rem;
		letter-spacing: -0.01em;
	}

	.brand-tag {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.62rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--rust);
		padding: 0.2rem 0.45rem;
		border: 1px solid currentColor;
		border-radius: 2px;
		line-height: 1;
		margin-left: 0.2rem;
	}

	.links {
		display: flex;
		align-items: center;
		gap: clamp(0.6rem, 2vw, 1.6rem);
		font-size: 0.92rem;
		font-weight: 500;
	}

	.links a {
		color: var(--ink-soft);
		padding: 0.25rem 0;
		border-bottom: 1px solid transparent;
		transition:
			color 0.18s,
			border-color 0.18s;
	}

	.links a:hover,
	.links a.active {
		color: var(--ink);
		border-bottom-color: var(--ink);
	}

	.links .gh {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
	}

	.links .ext {
		font-size: 0.85em;
		opacity: 0.6;
	}

	.theme-toggle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		padding: 0;
		margin-left: 0.2rem;
		background: transparent;
		border: 1px solid var(--rule-strong);
		border-radius: 4px;
		color: var(--ink-soft);
		cursor: pointer;
		transition:
			color 0.18s,
			border-color 0.18s,
			background 0.18s;
	}

	.theme-toggle:hover {
		color: var(--ink);
		border-color: var(--ink);
		background: var(--paper);
	}

	.theme-icon {
		display: inline-flex;
		line-height: 0;
	}

	@media (max-width: 640px) {
		.brand-tag {
			display: none;
		}
		.links {
			gap: 0.7rem;
			font-size: 0.84rem;
		}
		/* Keep the primary destinations (Docs, Ecosystem, Playground) on phones;
		   Compatibility + Benchmark are reachable from the home page. */
		.links a:nth-child(4),
		.links a:nth-child(5) {
			display: none;
		}
	}
</style>
