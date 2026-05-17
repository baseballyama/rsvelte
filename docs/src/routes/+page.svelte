<script lang="ts">
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import type { BenchmarkResults } from '$lib/types/benchmark';
	import SiteNav from '$lib/components/SiteNav.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';

	let bench = $state<BenchmarkResults | null>(null);
	let animated = $state(false);

	onMount(async () => {
		try {
			const res = await fetch(`${base}/benchmark-results.json`);
			if (res.ok) bench = await res.json();
		} catch {
			bench = null;
		}
		requestAnimationFrame(() => (animated = true));
	});

	const formatDuration = (ms: number): string => {
		if (ms < 1) return `${(ms * 1000).toFixed(0)}μs`;
		if (ms < 1000) return `${ms.toFixed(1)} ms`;
		return `${(ms / 1000).toFixed(2)} s`;
	};

	const formatThroughput = (v: number): string => {
		if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
		if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
		return `${Math.round(v)}`;
	};

	const formatDate = (iso: string): string =>
		new Date(iso).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

	const specs = [
		{ n: 1202, label: 'runtime / legacy', sub: 'svelte 4 parity' },
		{ n: 865, label: 'runtime / runes', sub: '$state / $derived / $effect' },
		{ n: 324, label: 'validator + a11y', sub: 'warnings & errors' },
		{ n: 245, label: 'svelte2tsx', sub: 'ecosystem / wave 1' },
		{ n: 179, label: 'css', sub: ':global / scoping / keyframes' },
		{ n: 144, label: 'compiler errors', sub: 'parse & semantic checks' }
	];

	const why = [
		{
			n: '01',
			h: 'Parallel by default.',
			p: 'Files fan out across rayon worker threads. The parser is thread-safe; phase outputs pass directly through without re-parsing.'
		},
		{
			n: '02',
			h: 'Compact memory.',
			p: 'u32 source positions, compact_str on hot paths, AST nodes shaped to keep cache lines warm under real workloads.'
		},
		{
			n: '03',
			h: 'Built for OXC.',
			p: 'Conventions mirror oxc_ast so the compiler drops cleanly into the wider OXC toolchain when it lands.'
		}
	];
</script>

<svelte:head>
	<title>rsvelte · the Svelte compiler, in Rust</title>
	<meta
		name="description"
		content="A Rust port of the Svelte 5 compiler. Same surface, identical output, parallelized by default."
	/>
</svelte:head>

<div class="page" class:in={animated}>
	<SiteNav active="home" />

	<header class="hero">
		<p class="eyebrow"><span class="rule"></span>Svelte 5 · written in Rust</p>

		<h1 class="title">
			The Svelte compiler,<br />rewritten in <span class="ink-rust">Rust</span>.
		</h1>

		<p class="lede">
			A drop-in replacement for <code>svelte/compiler</code> — same surface, identical output,
			parallelized by default.
		</p>

		<div class="cta">
			<a href="{base}/playground" class="btn btn-primary">
				Open playground <span aria-hidden="true">→</span>
			</a>
			<a href="{base}/benchmark" class="btn btn-ghost">
				View benchmark <span aria-hidden="true">→</span>
			</a>
		</div>

		<p class="install">
			<span class="prompt">$</span> pnpm add <span class="pkg">@rsvelte/compiler</span>
		</p>
	</header>

	<section class="perf" id="performance">
		<div class="section-head">
			<span class="num">01</span>
			<h2>
				{#if bench}
					<span class="ink-svelte">{bench.speedup.multiThreadVsJs.toFixed(1)}×</span> faster than
					<code>svelte/compiler</code>.
				{:else}
					Compilation, measured against <code>svelte/compiler</code>.
				{/if}
			</h2>
			<p class="lede">
				The benchmark runs the full compile pipeline — parse, analyze, codegen — over the official
				Svelte test corpus on the same machine.
			</p>
		</div>

		<div class="perf-grid">
			<figure class="bars">
				<figcaption>
					<span class="bars-title">Compile (client)</span>
					<span class="bars-sub"
						>{bench ? `${bench.testFilesCount.toLocaleString('en-US')} .svelte files` : '—'}</span
					>
				</figcaption>

				{#if bench}
					{@const max = Math.max(
						bench.javascript.durationMs,
						bench.rustSingleThread.durationMs,
						bench.rustMultiThread.durationMs
					)}
					{@const rows = [
						{
							k: 'svelte/compiler',
							tone: 'js',
							sub: 'JavaScript',
							dur: bench.javascript.durationMs
						},
						{
							k: 'rsvelte / single',
							tone: 'rs',
							sub: 'no parallelism',
							dur: bench.rustSingleThread.durationMs
						},
						{
							k: 'rsvelte / multi',
							tone: 'rm',
							sub: 'rayon fan-out',
							dur: bench.rustMultiThread.durationMs
						}
					]}
					<div class="bar-list">
						{#each rows as r, i (r.k)}
							<div class="bar-row" style="--i: {i};">
								<div class="bar-meta">
									<span class="bar-k">{r.k}</span>
									<span class="bar-s">{r.sub}</span>
								</div>
								<div class="bar-graph">
									<span class="bar-track">
										<span
											class="bar-fill bar-{r.tone}"
											style="--w: {(r.dur / max) * 100}%;"
										></span>
									</span>
									<span class="bar-t">{formatDuration(r.dur)}</span>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="bars-empty">
						<p>Benchmark data not loaded.</p>
					</div>
				{/if}

				<div class="bars-foot">
					<span>Lower is better</span>
					<span class="dot-sep">·</span>
					<span>{bench ? `recorded ${formatDate(bench.generatedAt)}` : ''}</span>
					{#if bench}
						<span class="dot-sep">·</span>
						<span><code>{bench.commitSha}</code></span>
					{/if}
				</div>
			</figure>

			<aside class="stats">
				<div class="stat stat-hero">
					<span class="stat-k">Full pipeline · multi</span>
					<span class="stat-n">
						{bench ? bench.speedup.multiThreadVsJs.toFixed(1) : '—'}<span class="stat-x">×</span>
					</span>
					<span class="stat-s">rayon fan-out vs. <code>svelte/compiler</code></span>
				</div>
				<div class="stat">
					<span class="stat-k">Parser only · multi</span>
					<span class="stat-n">
						{bench ? bench.parse.speedup.multiThreadVsJs.toFixed(0) : '—'}<span class="stat-x"
							>×</span
						>
					</span>
					<span class="stat-s">phase 1, isolated</span>
				</div>
				<div class="stat">
					<span class="stat-k">Throughput</span>
					<span class="stat-n">
						{bench ? formatThroughput(bench.rustMultiThread.throughputFilesPerSec) : '—'}<span
							class="stat-x">/s</span
						>
					</span>
					<span class="stat-s">files compiled per second</span>
				</div>
				<a class="stat stat-link" href="{base}/benchmark">
					<span class="stat-k">Full breakdown</span>
					<span class="stat-go"
						>parse · ssr · svelte2tsx <span aria-hidden="true">→</span></span
					>
				</a>
			</aside>
		</div>
	</section>

	<section class="dropin">
		<div class="section-head">
			<span class="num">02</span>
			<h2>One import. <em>No flags.</em></h2>
			<p class="lede">
				No bundler plugin to wire, no compiler flag to flip. Same <code>compile()</code>,
				<code>compileModule()</code>, <code>parse()</code>, <code>preprocess()</code>.
			</p>
		</div>

		<figure class="diff">
			<figcaption>
				<span class="diff-file">build.config.js</span>
			</figcaption>
			<pre><code><span class="d-line d-minus"><span class="d-sig">-</span> import * as svelte from <span class="d-str">'svelte/compiler'</span>;</span>
<span class="d-line d-plus"><span class="d-sig">+</span> import * as svelte from <span class="d-str">'@rsvelte/compiler'</span>;</span></code></pre>
		</figure>
	</section>

	<section class="compat">
		<div class="section-head">
			<span class="num">03</span>
			<h2>Every test, passing.</h2>
			<p class="lede">
				<span class="big-pct">3,341 / 3,341</span> in-scope fixtures from the official
				<code>sveltejs/svelte</code> suite. Full breakdown on the
				<a class="link" href="{base}/progress">compatibility page</a>.
			</p>
		</div>

		<dl class="spec-list">
			{#each specs as s, i (s.label)}
				<div class="spec-row" style="--i: {i};">
					<dt class="spec-k">{s.label}</dt>
					<dd class="spec-v">
						<span class="spec-n">{s.n.toLocaleString('en-US')}</span>
						<span class="spec-s">{s.sub}</span>
					</dd>
					<span class="spec-pct">100<span class="dim">%</span></span>
				</div>
			{/each}
		</dl>
	</section>

	<section class="why">
		<div class="section-head">
			<span class="num">04</span>
			<h2>Why a port?</h2>
		</div>

		<div class="why-list">
			{#each why as w (w.h)}
				<article class="why-row">
					<span class="why-n">{w.n}</span>
					<div class="why-body">
						<h3>{w.h}</h3>
						<p>{w.p}</p>
					</div>
				</article>
			{/each}
		</div>
	</section>

	<SiteFooter />
</div>

<style>
	.page {
		min-height: 100vh;
	}

	code,
	pre {
		font-family: 'Fira Mono', ui-monospace, 'SF Mono', Menlo, monospace;
	}

	/* HERO */
	.hero {
		max-width: 1080px;
		margin: 0 auto;
		padding: clamp(4rem, 12vh, 7rem) clamp(1rem, 4vw, 2.5rem) clamp(3rem, 6vh, 4.5rem);
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
		margin: 0 0 1.6rem;
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
		font-size: clamp(2.3rem, 6.2vw, 4.6rem);
		line-height: 1.02;
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
	}

	.lede {
		font-size: clamp(1.05rem, 1.3vw, 1.2rem);
		max-width: 52ch;
		color: var(--ink-soft);
		margin: 1.6rem 0 0;
	}

	.lede code {
		background: var(--paper);
		color: var(--ink);
		padding: 0.08em 0.4em;
		border-radius: 3px;
		font-size: 0.88em;
		border: 1px solid var(--rule);
	}

	.cta {
		display: flex;
		gap: 0.65rem;
		flex-wrap: wrap;
		margin-top: 2.4rem;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.78rem 1.25rem;
		font-family: 'Overpass', sans-serif;
		font-weight: 600;
		font-size: 0.95rem;
		border-radius: 4px;
		border: 1px solid transparent;
		transition:
			background 0.18s,
			color 0.18s,
			border-color 0.18s;
	}

	.btn span {
		transition: transform 0.18s;
	}

	.btn:hover span {
		transform: translateX(3px);
	}

	.btn-primary {
		background: var(--svelte);
		color: #fff;
	}

	.btn-primary:hover {
		background: var(--svelte-hover);
	}

	.btn-ghost {
		background: transparent;
		color: var(--ink);
		border-color: var(--rule-strong);
	}

	.btn-ghost:hover {
		border-color: var(--ink);
	}

	.install {
		font-family: 'Fira Mono', monospace;
		font-size: 0.9rem;
		color: var(--ink-soft);
		margin-top: 2.2rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--rule);
		max-width: 36rem;
	}

	.install .prompt {
		color: var(--svelte);
		margin-right: 0.6em;
	}

	.install .pkg {
		color: var(--rust);
	}

	/* PERF */
	.perf {
		background: var(--paper);
		border-block: 1px solid var(--rule);
	}

	.perf .section-head,
	.dropin .section-head,
	.compat .section-head,
	.why .section-head {
		max-width: 1080px;
		margin: 0 auto;
		padding: clamp(3.5rem, 8vh, 5.5rem) clamp(1rem, 4vw, 2.5rem) clamp(1.4rem, 3vh, 2.4rem);
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
		font-size: clamp(1.65rem, 3.2vw, 2.6rem);
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

	.section-head h2 code,
	.compat .lede code {
		font-family: 'Fira Mono', monospace;
		font-size: 0.78em;
		font-weight: 500;
		padding: 0.1em 0.45em;
		background: var(--bg);
		border: 1px solid var(--rule);
		border-radius: 3px;
		vertical-align: 0.05em;
	}

	.section-head .lede {
		grid-row: 2;
		grid-column: 2;
		margin-top: 0.7rem;
	}

	.perf-grid {
		max-width: 1080px;
		margin: 0 auto;
		padding: 0 clamp(1rem, 4vw, 2.5rem) clamp(4rem, 8vh, 6rem);
		display: grid;
		grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
		gap: clamp(1.5rem, 3vw, 2.5rem);
		align-items: start;
	}

	.bars {
		background: var(--bg);
		border: 1px solid var(--rule);
		border-radius: 6px;
		overflow: hidden;
	}

	.bars figcaption {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		padding: 0.9rem 1.25rem;
		border-bottom: 1px solid var(--rule);
	}

	.bars-title {
		font-weight: 600;
		font-size: 0.92rem;
		color: var(--ink);
	}

	.bars-sub {
		font-family: 'Fira Mono', monospace;
		font-size: 0.72rem;
		color: var(--ink-soft);
	}

	.bar-list {
		padding: 1.2rem 1.25rem 0.4rem;
		display: flex;
		flex-direction: column;
		gap: 1.05rem;
	}

	.bar-row {
		display: grid;
		grid-template-columns: minmax(10rem, 11rem) 1fr;
		gap: 1.2rem;
		align-items: center;
	}

	.bar-meta {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		min-width: 0;
	}

	.bar-k {
		font-family: 'Fira Mono', monospace;
		font-size: 0.78rem;
		font-weight: 500;
		color: var(--ink);
		letter-spacing: -0.01em;
	}

	.bar-s {
		font-family: 'Fira Mono', monospace;
		font-size: 0.66rem;
		color: var(--ink-faint);
		letter-spacing: 0.02em;
	}

	.bar-graph {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		gap: 0.85rem;
	}

	.bar-track {
		display: block;
		height: 10px;
		background: var(--paper);
		border: 1px solid var(--rule);
		border-radius: 999px;
		overflow: hidden;
	}

	.bar-fill {
		display: block;
		height: 100%;
		width: 0;
		border-radius: inherit;
		transition: width 0.9s cubic-bezier(0.22, 1, 0.36, 1);
		transition-delay: calc(0.12s * var(--i, 0) + 0.15s);
	}

	.page.in .bar-fill {
		width: var(--w);
	}

	.bar-js {
		background: linear-gradient(
			90deg,
			color-mix(in srgb, var(--ink-faint) 70%, transparent),
			var(--ink-faint)
		);
	}

	.bar-rs {
		background: linear-gradient(90deg, var(--rust-soft), var(--rust));
	}

	.bar-rm {
		background: linear-gradient(90deg, var(--rust-soft), var(--svelte));
	}

	.bar-t {
		font-family: 'Fira Mono', monospace;
		font-size: 0.82rem;
		color: var(--ink);
		font-variant-numeric: tabular-nums;
		min-width: 5.5rem;
		text-align: right;
	}

	.bars-foot {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		flex-wrap: wrap;
		padding: 0.85rem 1.25rem 1rem;
		font-family: 'Fira Mono', monospace;
		font-size: 0.7rem;
		color: var(--ink-faint);
		border-top: 1px solid var(--rule);
		margin-top: 0.6rem;
	}

	.bars-foot code {
		color: var(--ink-soft);
	}

	.dot-sep {
		opacity: 0.5;
	}

	.bars-empty {
		padding: 2rem 1.25rem;
		font-family: 'Fira Mono', monospace;
		font-size: 0.85rem;
		color: var(--ink-faint);
	}

	.stats {
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
	}

	.stat {
		background: var(--bg);
		border: 1px solid var(--rule);
		border-radius: 6px;
		padding: 1rem 1.2rem 1.15rem;
		display: grid;
		grid-template-areas: 'k k' 'n n' 's s';
		gap: 0.1rem;
	}

	.stat.stat-hero {
		border-color: var(--rust);
		background: var(--bg);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--rust) 8%, transparent);
	}

	.stat-k {
		grid-area: k;
		font-family: 'Fira Mono', monospace;
		font-size: 0.7rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--ink-soft);
	}

	.stat-n {
		grid-area: n;
		font-family: 'Overpass', sans-serif;
		font-weight: 800;
		font-size: clamp(2rem, 3.6vw, 2.7rem);
		line-height: 1;
		letter-spacing: -0.035em;
		color: var(--ink);
		font-variant-numeric: tabular-nums;
		display: inline-flex;
		align-items: baseline;
		margin-top: 0.35rem;
	}

	.stat-hero .stat-n {
		color: var(--rust);
	}

	.stat-x {
		font-family: 'Fira Mono', monospace;
		font-weight: 500;
		font-size: 0.4em;
		margin-left: 0.18em;
		color: var(--ink-faint);
		letter-spacing: 0.04em;
	}

	.stat-hero .stat-x {
		color: var(--rust);
		opacity: 0.75;
	}

	.stat-s {
		grid-area: s;
		font-size: 0.82rem;
		color: var(--ink-soft);
		margin-top: 0.4rem;
	}

	.stat-s code {
		font-size: 0.92em;
		color: var(--ink);
	}

	.stat-link {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		padding: 0.95rem 1.2rem 1rem;
		color: var(--ink);
		transition: border-color 0.18s;
	}

	.stat-link:hover {
		border-color: var(--ink);
	}

	.stat-go {
		font-family: 'Fira Mono', monospace;
		font-size: 0.78rem;
		color: var(--ink-soft);
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
	}

	.stat-link:hover .stat-go {
		color: var(--svelte);
	}

	/* DROP-IN */
	.dropin {
		max-width: 1080px;
		margin: 0 auto;
	}

	.diff {
		max-width: 680px;
		margin: 0 auto clamp(2.5rem, 6vh, 4rem);
		background: var(--paper);
		border: 1px solid var(--rule);
		border-radius: 6px;
		font-family: 'Fira Mono', monospace;
		overflow: hidden;
	}

	.diff figcaption {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.65rem 1rem;
		border-bottom: 1px solid var(--rule);
		font-size: 0.72rem;
		letter-spacing: 0.04em;
		color: var(--ink-faint);
	}

	.diff-file {
		color: var(--ink-soft);
	}

	.diff pre {
		margin: 0;
		padding: 0.9rem 1.15rem;
		font-size: 0.88rem;
		line-height: 1.75;
	}

	.d-line {
		display: block;
		padding: 0.1rem 0;
	}

	.d-sig {
		display: inline-block;
		width: 1.2em;
		opacity: 0.65;
	}

	.d-minus {
		color: var(--bad);
	}

	.d-plus {
		color: var(--ok);
		background: color-mix(in srgb, var(--ok) 8%, transparent);
	}

	.d-str {
		color: var(--rust);
	}

	/* COMPAT */
	.compat {
		max-width: 1080px;
		margin: 0 auto;
	}

	.big-pct {
		font-family: 'Overpass', sans-serif;
		font-weight: 800;
		color: var(--ink);
		letter-spacing: -0.01em;
	}

	.spec-list {
		max-width: 1080px;
		margin: 0 auto clamp(2.5rem, 5vh, 3.5rem);
		padding: 0 clamp(1rem, 4vw, 2.5rem);
	}

	.spec-row {
		display: grid;
		grid-template-columns: minmax(10rem, 14rem) 1fr auto;
		gap: 1.4rem;
		align-items: baseline;
		padding: 1rem 0;
		border-bottom: 1px solid var(--rule);
		opacity: 0;
		transform: translateY(6px);
		transition:
			opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1),
			transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
		transition-delay: calc(0.05s * var(--i, 0));
	}

	.page.in .spec-row {
		opacity: 1;
		transform: none;
	}

	.spec-row:first-child {
		border-top: 1px solid var(--rule);
	}

	.spec-k {
		font-weight: 600;
		font-size: 0.98rem;
		color: var(--ink);
		letter-spacing: -0.005em;
	}

	.spec-v {
		display: flex;
		align-items: baseline;
		gap: 0.85rem;
		margin: 0;
		min-width: 0;
	}

	.spec-n {
		font-family: 'Overpass', sans-serif;
		font-weight: 700;
		font-size: 1.15rem;
		color: var(--ink);
		font-variant-numeric: tabular-nums;
		letter-spacing: -0.015em;
	}

	.spec-s {
		font-family: 'Fira Mono', monospace;
		font-size: 0.74rem;
		color: var(--ink-soft);
	}

	.spec-pct {
		font-family: 'Fira Mono', monospace;
		font-size: 0.82rem;
		color: var(--ink);
		font-variant-numeric: tabular-nums;
	}

	.spec-pct .dim {
		color: var(--ink-faint);
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

	/* WHY */
	.why {
		max-width: 1080px;
		margin: 0 auto;
	}

	.why-list {
		max-width: 1080px;
		margin: 0 auto;
		padding: 0 clamp(1rem, 4vw, 2.5rem) clamp(4rem, 8vh, 6rem);
		display: grid;
		gap: 0;
	}

	.why-row {
		display: grid;
		grid-template-columns: minmax(2.5rem, 4rem) 1fr;
		gap: 1.5rem;
		padding: 1.6rem 0;
		border-bottom: 1px solid var(--rule);
		align-items: start;
	}

	.why-row:first-child {
		border-top: 1px solid var(--rule);
	}

	.why-n {
		font-family: 'Fira Mono', monospace;
		font-size: 0.72rem;
		letter-spacing: 0.16em;
		color: var(--rust);
	}

	.why-body h3 {
		font-family: 'Overpass', sans-serif;
		font-weight: 700;
		font-size: 1.18rem;
		letter-spacing: -0.015em;
		color: var(--ink);
		margin: 0 0 0.45rem;
	}

	.why-body p {
		font-size: 0.97rem;
		color: var(--ink-soft);
		margin: 0;
		max-width: 64ch;
	}

	/* RESPONSIVE */
	@media (max-width: 880px) {
		.perf-grid {
			grid-template-columns: 1fr;
		}
		.spec-row {
			grid-template-columns: 1fr auto;
			gap: 0.4rem 1rem;
		}
		.spec-v {
			grid-column: 1 / -1;
		}
	}

	@media (max-width: 640px) {
		.bar-row {
			grid-template-columns: 1fr;
			gap: 0.5rem;
		}
		.bar-meta {
			flex-direction: row;
			align-items: baseline;
			gap: 0.6rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.bar-fill,
		.spec-row,
		.btn span {
			transition: none !important;
		}
		.spec-row {
			opacity: 1 !important;
			transform: none !important;
		}
		.page.in .bar-fill {
			width: var(--w);
			transition: none !important;
		}
	}
</style>
