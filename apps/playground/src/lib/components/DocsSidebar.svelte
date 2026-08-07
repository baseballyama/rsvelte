<script lang="ts">
	import { base } from '$app/paths';
	import { GUIDES } from '$lib/docs';

	interface Props {
		current?: string;
	}

	let { current = '' }: Props = $props();
</script>

<aside class="sidebar">
	<nav aria-label="Documentation navigation">
		<div class="group">
			<p>Getting started</p>
			<a class:current={current === 'introduction'} href="{base}/">Introduction</a>
			<a class:current={current === 'overview'} href="{base}/docs">Overview</a>
		</div>

		<div class="group">
			<p>Toolchain</p>
			{#each GUIDES as guide (guide.id)}
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

	@media (max-width: 860px) {
		.sidebar {
			display: none;
		}
	}
</style>
