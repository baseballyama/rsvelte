<script lang="ts">
	import { base } from '$app/paths';
	import SiteNav from '$lib/components/SiteNav.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import EcoCard from '$lib/components/EcoCard.svelte';
	import { shipped, planned, delegated, counts } from '$lib/ecosystem';
</script>

<svelte:head>
	<title>Ecosystem · rsvelte</title>
	<meta
		name="description"
		content="The Svelte ecosystem, ported to Rust — compiler, svelte2tsx, svelte-check, fmt and vite-plugin-svelte as drop-in replacements, with links to every upstream tool and what's delegated to OXC."
	/>
</svelte:head>

<div class="page">
	<SiteNav active="ecosystem" />

	<header class="hero">
		<p class="eyebrow"><span class="rule"></span>The ecosystem · in Rust</p>

		<h1 class="title">
			The Svelte ecosystem,<br />ported to <span class="ink-rust">Rust</span>.
		</h1>

		<p class="lede">
			rsvelte is more than a compiler. Every tool on the hot path of a Svelte project gets a
			Rust-native, <strong>drop-in</strong> replacement — same surface, identical behaviour, only
			<span class="ink-svelte">faster</span>. Below is the full inventory: what's shipped, what's
			planned, and what we deliberately hand to the wider
			<a class="link" href="https://oxc.rs/" target="_blank" rel="noopener">OXC</a> toolchain.
		</p>

		<dl class="hero-meta">
			<div>
				<dt>Shipped</dt>
				<dd><span class="big ok">{counts.shipped}</span> <span class="dim">drop-in packages</span></dd>
			</div>
			<div>
				<dt>Planned</dt>
				<dd><span class="big warn">{counts.planned}</span> <span class="dim">on the roadmap</span></dd>
			</div>
			<div>
				<dt>Delegated</dt>
				<dd>
					<span class="big">{counts.delegated}</span> <span class="dim">routed to OXC / JS</span>
				</dd>
			</div>
			<div>
				<dt>Top speedup</dt>
				<dd><span class="big ink-svelte">204×</span> <span class="dim">fmt vs. JS</span></dd>
			</div>
		</dl>
	</header>

	<section class="group">
		<div class="section-head">
			<span class="num">01</span>
			<h2><span class="ink-ok">Shipped</span> — usable today.</h2>
			<p class="lede">
				Published under the <code>@rsvelte</code> scope on npm. Swap the import (or add a
				package-manager override) and the rest of your project is unchanged. Speedups are
				multi-threaded rsvelte vs. the official JavaScript tool — see the
				<a class="link" href="{base}/benchmark">benchmark</a>.
			</p>
		</div>
		<div class="grid">
			{#each shipped as c (c.name)}
				<EcoCard {c} />
			{/each}
		</div>
	</section>

	<section class="group">
		<div class="section-head">
			<span class="num">02</span>
			<h2><span class="ink-warn">Planned</span> — on the roadmap.</h2>
			<p class="lede">
				Not yet usable, and honest about why. CLI type-checking is already covered today by
				<code>@rsvelte/svelte-check</code>.
			</p>
		</div>
		<div class="grid">
			{#each planned as c (c.name)}
				<EcoCard {c} />
			{/each}
		</div>
	</section>

	<section class="group">
		<div class="section-head">
			<span class="num">03</span>
			<h2>Delegated — <em>not</em> ported, on purpose.</h2>
			<p class="lede">
				These aren't gaps. Linting, formatting and bundling are themselves moving to Rust through
				<a class="link" href="https://oxc.rs/" target="_blank" rel="noopener">OXC</a>; rsvelte's job
				is to give those tools a Svelte surface to call into, not to fork them. Markdown and
				wrapper tools stay in JS where their dependencies live.
			</p>
		</div>
		<div class="grid">
			{#each delegated as c (c.name)}
				<EcoCard {c} />
			{/each}
		</div>
	</section>

	<section class="outro">
		<p>
			The plan in full — wave structure, acceptance criteria and risk registers — lives in
			<a
				class="link"
				href="https://github.com/baseballyama/rsvelte/blob/main/docs/ecosystem-implementation-plan.md"
				target="_blank"
				rel="noopener">docs/ecosystem-implementation-plan.md</a
			>.
		</p>
	</section>

	<SiteFooter />
</div>

<style>
	.page {
		min-height: 100vh;
	}

	code {
		font-family: 'Fira Mono', ui-monospace, 'SF Mono', Menlo, monospace;
	}

	/* HERO */
	.hero {
		max-width: 1080px;
		margin: 0 auto;
		padding: clamp(3.5rem, 9vh, 5.5rem) clamp(1rem, 4vw, 2.5rem) clamp(2rem, 4vh, 3rem);
	}

	.eyebrow {
		display: inline-flex;
		align-items: center;
		gap: 0.7rem;
		font-family: 'Fira Mono', monospace;
		font-size: 0.75rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--rust);
		margin: 0 0 1.4rem;
	}

	.eyebrow .rule {
		display: inline-block;
		width: 24px;
		height: 1px;
		background: var(--rust);
	}

	.title {
		font-family: 'Overpass', sans-serif;
		font-weight: 800;
		font-size: clamp(2.1rem, 5.4vw, 3.8rem);
		line-height: 1.04;
		letter-spacing: -0.03em;
		color: var(--ink);
		margin: 0;
	}

	.ink-rust {
		color: var(--rust);
		font-style: italic;
		font-weight: 700;
	}

	.ink-svelte {
		color: var(--svelte);
		font-style: italic;
	}

	.lede {
		font-size: clamp(1.02rem, 1.25vw, 1.16rem);
		max-width: 60ch;
		color: var(--ink-soft);
		margin: 1.6rem 0 0;
		line-height: 1.6;
	}

	.lede strong {
		color: var(--ink);
		font-weight: 700;
	}

	.lede code {
		background: var(--paper);
		color: var(--ink);
		padding: 0.08em 0.4em;
		border-radius: 3px;
		font-size: 0.86em;
		border: 1px solid var(--rule);
	}

	.link {
		color: var(--svelte);
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 3px;
	}

	.link:hover {
		color: var(--svelte-hover);
	}

	.hero-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 1.8rem 2.6rem;
		margin-top: 2.2rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--rule);
	}

	.hero-meta > div {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.hero-meta dt {
		font-family: 'Fira Mono', monospace;
		font-size: 0.66rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}

	.hero-meta dd {
		display: inline-flex;
		align-items: baseline;
		gap: 0.5rem;
		margin: 0;
	}

	.hero-meta .big {
		font-family: 'Overpass', sans-serif;
		font-weight: 800;
		font-size: 1.7rem;
		line-height: 1;
		letter-spacing: -0.03em;
		color: var(--ink);
		font-variant-numeric: tabular-nums;
	}

	.hero-meta .big.ok {
		color: var(--ok);
	}
	.hero-meta .big.warn {
		color: var(--warn);
	}
	.hero-meta .big.ink-svelte {
		color: var(--svelte);
		font-style: normal;
	}

	.hero-meta .dim {
		font-family: 'Fira Mono', monospace;
		font-size: 0.76rem;
		color: var(--ink-soft);
	}

	/* GROUPS */
	.group {
		max-width: 1080px;
		margin: 0 auto;
	}

	.section-head {
		max-width: 1080px;
		padding: clamp(2.5rem, 6vh, 4rem) clamp(1rem, 4vw, 2.5rem) clamp(1.2rem, 3vh, 1.8rem);
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.4rem 1.4rem;
		align-items: baseline;
	}

	.section-head .num {
		font-family: 'Fira Mono', monospace;
		font-size: 0.7rem;
		letter-spacing: 0.18em;
		color: var(--rust);
		grid-row: 1;
		grid-column: 1;
	}

	.section-head h2 {
		font-family: 'Overpass', sans-serif;
		font-weight: 700;
		font-size: clamp(1.5rem, 3vw, 2.3rem);
		line-height: 1.1;
		letter-spacing: -0.022em;
		margin: 0;
		color: var(--ink);
		grid-row: 1;
		grid-column: 2;
	}

	.section-head h2 em {
		font-style: italic;
		color: var(--svelte);
		font-weight: 700;
	}

	.ink-ok {
		color: var(--ok);
	}
	.ink-warn {
		color: var(--warn);
	}

	.section-head .lede {
		grid-row: 2;
		grid-column: 2;
		margin-top: 0.6rem;
		max-width: 66ch;
		font-size: clamp(0.96rem, 1.1vw, 1.06rem);
	}

	.section-head .lede code {
		font-size: 0.86em;
		padding: 0.06em 0.4em;
		background: var(--paper);
		border: 1px solid var(--rule);
		border-radius: 3px;
		color: var(--rust);
	}

	.grid {
		padding: 0 clamp(1rem, 4vw, 2.5rem);
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1rem;
	}

	/* OUTRO */
	.outro {
		max-width: 1080px;
		margin: 0 auto;
		padding: clamp(3rem, 7vh, 5rem) clamp(1rem, 4vw, 2.5rem) clamp(4rem, 8vh, 6rem);
	}

	.outro p {
		font-size: 0.95rem;
		color: var(--ink-soft);
		max-width: 64ch;
	}

	@media (max-width: 880px) {
		.section-head {
			grid-template-columns: auto 1fr;
		}
	}
</style>
