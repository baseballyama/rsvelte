<script lang="ts">
	import { base } from '$app/paths';
	import { GUIDES } from '$lib/docs';
	import SiteNav from '$lib/components/SiteNav.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
</script>

<svelte:head>
	<title>Docs · rsvelte</title>
	<meta
		name="description"
		content="Usage guides for every rsvelte package — the compiler, svelte2tsx, the formatter, svelte-check and the Vite plugin."
	/>
</svelte:head>

<div class="page">
	<SiteNav active="docs" />

	<main class="wrap">
		<header class="head">
			<p class="eyebrow"><span class="rule"></span>Documentation</p>
			<h1 class="title">Guides</h1>
			<p class="lede">
				One guide per package in the rsvelte toolchain — install, API, examples and flags.
				Three of them (compiler, svelte2tsx, fmt) also run live in the
				<a href="{base}/playground">playground</a>.
			</p>
		</header>

		<div class="grid">
			{#each GUIDES as guide (guide.id)}
				<a class="card" href="{base}/docs/{guide.id}">
					<div class="card-head">
						<h2 class="card-title">{guide.title}</h2>
						{#if guide.runnable}
							<span class="badge run">runs in browser</span>
						{:else}
							<span class="badge cli">CLI only</span>
						{/if}
					</div>
					<code class="pkg">{guide.pkg}</code>
					<p class="blurb">{guide.tagline}</p>
					<p class="dropin">drop-in for <code>{guide.dropInFor}</code></p>
					<span class="more">Read guide →</span>
				</a>
			{/each}
		</div>
	</main>

	<SiteFooter />
</div>

<style>
	.page {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.wrap {
		flex: 1;
		width: 100%;
		max-width: 64rem;
		margin: 0 auto;
		padding: clamp(1.6rem, 4vh, 2.6rem) clamp(1rem, 4vw, 2rem) 3rem;
	}

	.eyebrow {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.72rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--rust);
		margin: 0;
	}

	.eyebrow .rule {
		display: inline-block;
		width: 20px;
		height: 1px;
		background: var(--rust);
	}

	.title {
		font-weight: 800;
		font-size: clamp(2rem, 5vw, 3rem);
		letter-spacing: -0.03em;
		color: var(--ink);
		margin: 0.4rem 0 0.6rem;
	}

	.lede {
		font-size: 1.05rem;
		line-height: 1.65;
		color: var(--ink-soft);
		max-width: 44rem;
		margin: 0;
	}

	.lede a {
		color: var(--svelte);
		border-bottom: 1px solid currentColor;
	}

	.grid {
		margin-top: 2.2rem;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr));
		gap: 1rem;
	}

	.card {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 1.1rem 1.1rem 1rem;
		border: 1px solid var(--rule);
		border-radius: 8px;
		background: var(--bg);
		transition:
			border-color 0.18s,
			transform 0.18s,
			box-shadow 0.18s;
	}

	.card:hover {
		border-color: var(--rule-strong);
		transform: translateY(-2px);
		box-shadow: 0 6px 20px -12px rgba(0, 0, 0, 0.25);
	}

	.card-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.card-title {
		font-size: 1.15rem;
		font-weight: 700;
		letter-spacing: -0.01em;
		color: var(--ink);
		margin: 0;
	}

	.badge {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.6rem;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		padding: 0.2rem 0.45rem;
		border-radius: 999px;
		white-space: nowrap;
	}

	.badge.run {
		color: var(--svelte);
		background: color-mix(in srgb, var(--svelte) 12%, transparent);
	}

	.badge.cli {
		color: var(--ink-faint);
		background: var(--paper-2);
	}

	.pkg {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.74rem;
		color: var(--ink-soft);
	}

	.blurb {
		font-size: 0.88rem;
		line-height: 1.55;
		color: var(--ink-soft);
		margin: 0;
		flex: 1;
	}

	.dropin {
		font-size: 0.76rem;
		color: var(--ink-faint);
		margin: 0;
	}

	.dropin code {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.72rem;
		color: var(--ink-soft);
	}

	.more {
		font-size: 0.82rem;
		font-weight: 600;
		color: var(--svelte);
		margin-top: 0.2rem;
	}
</style>
