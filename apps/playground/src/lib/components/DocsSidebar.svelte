<script lang="ts">
	import { base } from '$app/paths';
	import { GUIDE_LIST } from '$lib/docs';

	interface Props {
		current?: string;
	}

	let { current = '' }: Props = $props();
	let open = $state(false);
</script>

<aside class="sidebar">
	<button
		type="button"
		class="disclosure"
		aria-expanded={open}
		aria-controls="docs-nav"
		onclick={() => (open = !open)}
	>
		<span>Documentation menu</span>
		<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" class:flip={open}>
			<path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5" />
		</svg>
	</button>

	<nav id="docs-nav" class:open aria-label="Documentation navigation">
		<div class="group">
			<p>Getting started</p>
			<a class:current={current === 'introduction'} href="{base}/">Introduction</a>
			<a class:current={current === 'overview'} href="{base}/docs">Overview</a>
		</div>

		<div class="group">
			<p>Toolchain</p>
			{#each GUIDE_LIST as guide (guide.id)}
				<a class:current={current === guide.id} href="{base}/docs/{guide.id}">{guide.title}</a>
			{/each}
		</div>

		<div class="group">
			<p>Project</p>
			<a class:current={current === 'playground'} href="{base}/playground">Playground</a>
			<a class:current={current === 'compatibility'} href="{base}/progress">Compatibility</a>
			<a class:current={current === 'benchmark'} href="{base}/benchmark">Benchmarks</a>
		</div>
	</nav>
</aside>

<style>
	.sidebar {
		grid-area: nav;
		padding: 2rem 1.25rem 4rem 1rem;
		border-right: 1px solid var(--rule);
	}

	nav {
		position: sticky;
		top: 5rem;
		display: flex;
		flex-direction: column;
		gap: 1.75rem;
	}

	.group {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}

	.group p {
		margin: 0 0 0.4rem 0.65rem;
		font-size: 0.75rem;
		font-weight: 650;
		color: var(--ink);
	}

	a {
		padding: 0.38rem 0.65rem;
		border-radius: 5px;
		font-size: 0.84rem;
		line-height: 1.35;
		color: var(--ink-soft);
	}

	a:hover {
		background: var(--paper);
		color: var(--ink);
	}

	a.current {
		background: color-mix(in srgb, var(--accent) 10%, var(--bg));
		color: var(--accent);
		font-weight: 600;
	}

	.disclosure {
		display: none;
		width: 100%;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.6rem 0.75rem;
		border: 1px solid var(--rule);
		border-radius: 6px;
		background: var(--paper);
		font-family: inherit;
		font-size: 0.86rem;
		font-weight: 600;
		color: var(--ink);
		cursor: pointer;
	}

	.disclosure svg {
		flex: none;
		transition: transform 0.15s ease;
	}

	.disclosure svg.flip {
		transform: rotate(180deg);
	}

	@media (max-width: 860px) {
		.sidebar {
			padding: 1rem clamp(1rem, 5vw, 2.5rem);
			border-right: 0;
			border-bottom: 1px solid var(--rule);
		}

		.disclosure {
			display: flex;
		}

		nav {
			display: none;
			position: static;
			gap: 1.25rem;
			padding-top: 1rem;
		}

		nav.open {
			display: flex;
		}
	}
</style>
