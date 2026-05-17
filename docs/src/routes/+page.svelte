<script lang="ts">
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import type { BenchmarkResults } from '$lib/types/benchmark';

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
	<nav class="nav">
		<a href="{base}/" class="brand" aria-label="rsvelte home">
			<span class="mark" aria-hidden="true">
				<svg viewBox="0 0 24 24" width="20" height="20" fill="none">
					<path d="M19 8 13 18l-2-4 6-10 2 4Z" fill="#ff3e00" />
					<path d="M5 16 11 6l2 4-6 10-2-4Z" fill="#b7410e" />
				</svg>
			</span>
			<span class="brand-text">rsvelte</span>
			<span class="brand-tag">rust&nbsp;port</span>
		</a>

		<div class="nav-links">
			<a href="{base}/playground">Playground</a>
			<a href="{base}/progress">Compatibility</a>
			<a href="{base}/benchmark">Benchmark</a>
			<a href="https://github.com/baseballyama/rsvelte" target="_blank" rel="noopener" class="gh">
				GitHub <span aria-hidden="true" class="ext">↗</span>
			</a>
		</div>
	</nav>

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

	<footer class="foot">
		<div class="foot-inner">
			<div class="foot-mark">
				<svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
					<path d="M19 8 13 18l-2-4 6-10 2 4Z" fill="#ff3e00" />
					<path d="M5 16 11 6l2 4-6 10-2-4Z" fill="#b7410e" />
				</svg>
				<span>rsvelte</span>
			</div>
			<div class="foot-meta">
				<span>MIT licensed</span>
				<span class="sep">·</span>
				<span>Mirrors sveltejs/svelte@5.51.3</span>
				<span class="sep">·</span>
				<a href="https://github.com/baseballyama/rsvelte" target="_blank" rel="noopener">
					github.com/baseballyama/rsvelte
				</a>
			</div>
		</div>
	</footer>
</div>

<style>
	.page {
		--bg: #ffffff;
		--paper: #faf9f5;
		--ink: #14130f;
		--ink-soft: #5a5750;
		--ink-faint: #97938a;
		--rule: #ececdf;
		--rule-strong: #d8d4c4;

		--svelte: #ff3e00;
		--rust: #b7410e;
		--rust-soft: #cf7a4a;

		background: var(--bg);
		color: var(--ink);
		font-size: 16px;
		line-height: 1.6;
		min-height: 100vh;
	}

	code,
	pre {
		font-family: 'Fira Mono', ui-monospace, 'SF Mono', Menlo, monospace;
	}

	/* NAV */
	.nav {
		position: sticky;
		top: 0;
		z-index: 30;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 2rem;
		padding: 0.9rem clamp(1rem, 4vw, 2.5rem);
		background: rgba(255, 255, 255, 0.88);
		border-bottom: 1px solid var(--rule);
		backdrop-filter: saturate(150%) blur(6px);
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
		font-family: 'Fira Mono', monospace;
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

	.nav-links {
		display: flex;
		align-items: center;
		gap: clamp(0.8rem, 2.2vw, 1.8rem);
		font-size: 0.92rem;
		font-weight: 500;
	}

	.nav-links a {
		color: var(--ink-soft);
		padding: 0.25rem 0;
		border-bottom: 1px solid transparent;
		transition:
			color 0.18s,
			border-color 0.18s;
	}

	.nav-links a:hover {
		color: var(--ink);
		border-bottom-color: var(--ink);
	}

	.nav-links .gh .ext {
		font-size: 0.85em;
		opacity: 0.6;
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
		background: #e83700;
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
		background: linear-gradient(90deg, #94908b, #b3aea4);
	}

	.bar-rs {
		background: linear-gradient(90deg, var(--rust-soft), var(--rust));
	}

	.bar-rm {
		background: linear-gradient(90deg, #ff7a3d, var(--svelte));
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
		box-shadow: 0 0 0 3px rgba(183, 65, 14, 0.06);
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
		color: #a04030;
	}

	.d-plus {
		color: #2f6f3a;
		background: rgba(47, 111, 58, 0.06);
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
		color: #d83500;
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

	/* FOOT */
	.foot {
		border-top: 1px solid var(--rule);
		background: var(--paper);
	}

	.foot-inner {
		max-width: 1080px;
		margin: 0 auto;
		padding: 1.5rem clamp(1rem, 4vw, 2.5rem);
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.foot-mark {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		font-weight: 700;
		font-size: 0.95rem;
	}

	.foot-meta {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		font-family: 'Fira Mono', monospace;
		font-size: 0.74rem;
		color: var(--ink-soft);
		flex-wrap: wrap;
	}

	.foot-meta .sep {
		opacity: 0.5;
	}

	.foot-meta a {
		color: var(--ink-soft);
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 3px;
	}

	.foot-meta a:hover {
		color: var(--svelte);
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
		.brand-tag {
			display: none;
		}
		.nav-links {
			gap: 0.85rem;
			font-size: 0.85rem;
		}
		.nav-links a:nth-child(2) {
			display: none;
		}
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
