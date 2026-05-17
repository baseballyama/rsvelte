<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import type { PageData } from './$types';
	import type { BenchmarkTaskResults } from '$lib/types/benchmark';
	import SiteNav from '$lib/components/SiteNav.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';

	let { data }: { data: PageData } = $props();

	type TabId = 'full' | 'parse' | 'svelte2tsx';

	let activeTab = $state<TabId>('full');
	// `animationTime` is the elapsed wall-clock ms since the run started.
	// Each bar shows `min(animationTime, this.durationMs)`, so the bars
	// fill at the *actual* measured speed — the slow JS bar is still
	// inching forward when the rsvelte-multi bar has already crossed the
	// finish line, which is the whole point.
	let animationTime = $state(0);
	let isAnimating = $state(false);
	let animationComplete = $state(false);

	// Hard ceiling for the wall-clock animation so very fast tasks (e.g. the
	// parser-only run can finish in ~150 ms) don't blink past unreadably and
	// very slow ones (full-pipeline JS at ~1 s) don't drag the user. We stop
	// once the slowest bar is done OR 4 s, whichever comes first.
	const ANIMATION_HARD_CAP_MS = 4000;

	const tabMeta: Record<TabId, { label: string; sub: string }> = {
		full: { label: 'Full pipeline', sub: 'parse / analyze / codegen' },
		parse: { label: 'Parser only', sub: 'phase 1, isolated' },
		svelte2tsx: { label: 'svelte2tsx', sub: '.svelte / .tsx generation' }
	};

	const formatDate = (iso: string): string =>
		new Date(iso).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

	const formatDuration = (ms: number): string => {
		if (ms < 1) return `${(ms * 1000).toFixed(1)}μs`;
		if (ms < 1000) return `${ms.toFixed(1)} ms`;
		return `${(ms / 1000).toFixed(2)} s`;
	};

	const formatThroughput = (v: number): string => {
		if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
		if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
		return v.toFixed(0);
	};

	const getActiveTask = (): BenchmarkTaskResults | null => {
		if (!data.results) return null;
		const r = data.results;
		if (activeTab === 'full') return r;
		if (activeTab === 'parse') return r.parse;
		if (activeTab === 'svelte2tsx' && r.svelte2tsx) return r.svelte2tsx;
		return null;
	};

	const hasTab = (tab: TabId): boolean => {
		if (!data.results) return false;
		if (tab === 'full' || tab === 'parse') return true;
		return Boolean(data.results.svelte2tsx);
	};

	const activeTask = $derived(getActiveTask());

	const getMaxDuration = (r: BenchmarkTaskResults): number =>
		Math.max(r.javascript.durationMs, r.rustSingleThread.durationMs, r.rustMultiThread.durationMs);

	const getAnimatedWidth = (r: BenchmarkTaskResults, duration: number): number => {
		const maxDuration = getMaxDuration(r);
		if (animationComplete) return (duration / maxDuration) * 100;
		const filled = Math.min(animationTime, duration);
		return (filled / maxDuration) * 100;
	};

	const getAnimatedTime = (_: BenchmarkTaskResults, duration: number): number => {
		if (animationComplete) return duration;
		return Math.min(animationTime, duration);
	};

	const startAnimation = () => {
		if (isAnimating || !data.results) return;
		isAnimating = true;
		animationComplete = false;
		animationTime = 0;
		const task = getActiveTask();
		const finishAt = task
			? Math.min(getMaxDuration(task), ANIMATION_HARD_CAP_MS)
			: ANIMATION_HARD_CAP_MS;
		const start = performance.now();
		const tick = () => {
			const elapsed = performance.now() - start;
			animationTime = elapsed;
			if (elapsed >= finishAt) {
				animationTime = finishAt;
				isAnimating = false;
				animationComplete = true;
				return;
			}
			requestAnimationFrame(tick);
		};
		requestAnimationFrame(tick);
	};

	const switchTab = (tab: TabId) => {
		if (!hasTab(tab)) return;
		activeTab = tab;
		startAnimation();
	};

	onMount(() => {
		if (data.results) setTimeout(startAnimation, 250);
	});
</script>

<svelte:head>
	<title>Benchmark · rsvelte</title>
	<meta
		name="description"
		content="Compilation speed benchmark — rsvelte (Rust, single + multi-threaded) against the official svelte/compiler."
	/>
</svelte:head>

<div class="page">
	<SiteNav active="benchmark" />

	{#if data.error}
		<section class="empty">
			<p class="eyebrow"><span class="rule"></span>Benchmark · unavailable</p>
			<h1>No benchmark data yet.</h1>
			<p class="lede">{data.error}</p>
			<pre class="empty-code"><code><span class="c-cmt"># From the repo root</span>
<span class="c-prompt">$</span> cargo build <span class="c-flag">--release</span>
<span class="c-prompt">$</span> node scripts/run-benchmark.mjs &gt; docs/static/benchmark-results.json</code></pre>
		</section>
	{:else if data.results}
		{@const r = data.results}
		{@const task = activeTask}

		<header class="hero">
			<p class="eyebrow"><span class="rule"></span>Compilation speed · against svelte/compiler</p>

			<h1 class="title">
				<span class="ink-svelte">{r.speedup.multiThreadVsJs.toFixed(1)}×</span> faster than
				<code>svelte/compiler</code>.
			</h1>

			<dl class="hero-meta">
				<div>
					<dt>Corpus</dt>
					<dd>{r.testFilesCount.toLocaleString('en-US')} .svelte files</dd>
				</div>
				<div>
					<dt>Recorded</dt>
					<dd>{formatDate(r.generatedAt)}</dd>
				</div>
				<div>
					<dt>Commit</dt>
					<dd><code>{r.commitSha}</code></dd>
				</div>
			</dl>
		</header>

		<section class="stats">
			<article class="stat stat-hero">
				<span class="stat-k">Multi-threaded</span>
				<span class="stat-n">
					{r.speedup.multiThreadVsJs.toFixed(1)}<span class="stat-x">×</span>
				</span>
				<span class="stat-s">rayon fan-out · full pipeline</span>
			</article>
			<article class="stat">
				<span class="stat-k">Single-threaded</span>
				<span class="stat-n">
					{r.speedup.singleThreadVsJs.toFixed(1)}<span class="stat-x">×</span>
				</span>
				<span class="stat-s">no parallelism</span>
			</article>
			<article class="stat">
				<span class="stat-k">Throughput</span>
				<span class="stat-n">
					{formatThroughput(r.rustMultiThread.throughputFilesPerSec)}<span class="stat-x">/s</span>
				</span>
				<span class="stat-s">files compiled per second</span>
			</article>
			<article class="stat">
				<span class="stat-k">Parser alone</span>
				<span class="stat-n">
					{r.parse.speedup.multiThreadVsJs.toFixed(0)}<span class="stat-x">×</span>
				</span>
				<span class="stat-s">phase 1, isolated</span>
			</article>
		</section>

		<section class="chart">
			<header class="chart-head">
				<div class="tabs" role="tablist" aria-label="Benchmark task">
					{#each ['full', 'parse', 'svelte2tsx'] as const as tab (tab)}
						<button
							role="tab"
							type="button"
							aria-selected={activeTab === tab}
							class="tab"
							class:active={activeTab === tab}
							disabled={!hasTab(tab)}
							onclick={() => switchTab(tab)}
						>
							<span class="tab-label">{tabMeta[tab].label}</span>
							<span class="tab-sub">{tabMeta[tab].sub}</span>
						</button>
					{/each}
				</div>
				<button class="replay" onclick={startAnimation} disabled={isAnimating || !task}>
					<span class="replay-i" aria-hidden="true">↻</span>
					Replay
				</button>
			</header>

			{#if task}
				{@const t = task}
				<div class="bars">
					{#each [
						{ name: 'svelte/compiler', sub: 'JavaScript', dur: t.javascript.durationMs, tone: 'js' },
						{ name: 'rsvelte / single', sub: 'no parallelism', dur: t.rustSingleThread.durationMs, tone: 'rs' },
						{ name: 'rsvelte / multi', sub: 'rayon fan-out', dur: t.rustMultiThread.durationMs, tone: 'rm' }
					] as bar (bar.name)}
						<div class="bar-row">
							<div class="bar-meta">
								<span class="bar-name">{bar.name}</span>
								<span class="bar-sub">{bar.sub}</span>
							</div>
							<div class="bar-graph">
								<span class="bar-track">
									<span
										class="bar-fill bar-{bar.tone}"
										style="width: {getAnimatedWidth(t, bar.dur)}%;"
									></span>
								</span>
								<span class="bar-time">
									{formatDuration(getAnimatedTime(t, bar.dur))}
								</span>
							</div>
						</div>
					{/each}
				</div>

				<footer class="chart-foot">
					<span>Lower is better · same machine, same corpus</span>
					<span class="speedup">
						<span class="speedup-k">Speedup vs JS</span>
						<span class="speedup-v">
							{t.speedup.multiThreadVsJs.toFixed(1)}<span class="x">×</span>
							<span class="speedup-sep">·</span>
							<span class="speedup-st">
								single {t.speedup.singleThreadVsJs.toFixed(1)}×
							</span>
						</span>
					</span>
				</footer>
			{:else}
				<div class="missing">
					<p>No data for this benchmark task.</p>
				</div>
			{/if}
		</section>

		<section class="repro">
			<div class="section-head">
				<span class="num">02</span>
				<h2>Reproduce it yourself.</h2>
			</div>
			<figure class="diff">
				<figcaption>
					<span class="diff-file">your-shell</span>
				</figcaption>
				<pre><code><span class="c-cmt"># 1. Build the Rust compiler in release mode</span>
<span class="c-prompt">$</span> cargo build <span class="c-flag">--release</span>

<span class="c-cmt"># 2. Run the corpus benchmark</span>
<span class="c-prompt">$</span> node scripts/run-benchmark.mjs <span class="c-op">&gt;</span> docs/static/benchmark-results.json

<span class="c-cmt"># 3. View the report locally</span>
<span class="c-prompt">$</span> cd docs <span class="c-op">&amp;&amp;</span> pnpm dev</code></pre>
			</figure>
		</section>
	{/if}

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
		font-size: clamp(2rem, 4.6vw, 3.4rem);
		line-height: 1.05;
		letter-spacing: -0.025em;
		color: var(--ink);
		margin: 0;
		max-width: 22ch;
	}

	.title code {
		font-family: 'Fira Mono', monospace;
		font-size: 0.7em;
		font-weight: 500;
		padding: 0.06em 0.42em;
		background: var(--paper);
		border: 1px solid var(--rule);
		border-radius: 4px;
		color: var(--ink);
		vertical-align: 0.08em;
	}

	.ink-svelte {
		color: var(--svelte);
		font-style: italic;
		font-weight: 800;
	}

	.hero-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 2.5rem;
		margin-top: 2rem;
		padding-top: 1.4rem;
		border-top: 1px solid var(--rule);
	}

	.hero-meta > div {
		display: flex;
		flex-direction: column;
		gap: 0.18rem;
	}

	.hero-meta dt {
		font-family: 'Fira Mono', monospace;
		font-size: 0.66rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}

	.hero-meta dd {
		font-family: 'Fira Mono', monospace;
		font-size: 0.86rem;
		color: var(--ink);
		margin: 0;
	}

	.hero-meta code {
		font-size: 0.92em;
		color: var(--rust);
	}

	/* STATS */
	.stats {
		max-width: 1080px;
		margin: 0 auto;
		padding: 0 clamp(1rem, 4vw, 2.5rem) clamp(2rem, 4vh, 3rem);
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 0.7rem;
	}

	.stat {
		background: var(--bg);
		border: 1px solid var(--rule);
		border-radius: 6px;
		padding: 1.05rem 1.2rem 1.2rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.stat.stat-hero {
		border-color: var(--rust);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--rust) 8%, transparent);
	}

	.stat-k {
		font-family: 'Fira Mono', monospace;
		font-size: 0.7rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--ink-soft);
	}

	.stat-n {
		font-family: 'Overpass', sans-serif;
		font-weight: 800;
		font-size: clamp(1.9rem, 3vw, 2.5rem);
		line-height: 1;
		letter-spacing: -0.03em;
		color: var(--ink);
		font-variant-numeric: tabular-nums;
		display: inline-flex;
		align-items: baseline;
	}

	.stat.stat-hero .stat-n {
		color: var(--rust);
	}

	.stat-x {
		font-family: 'Fira Mono', monospace;
		font-weight: 500;
		font-size: 0.42em;
		margin-left: 0.18em;
		color: var(--ink-faint);
		letter-spacing: 0.04em;
	}

	.stat.stat-hero .stat-x {
		color: var(--rust);
		opacity: 0.75;
	}

	.stat-s {
		font-size: 0.82rem;
		color: var(--ink-soft);
	}

	/* CHART */
	.chart {
		max-width: 1080px;
		margin: 0 auto;
		padding: 0 clamp(1rem, 4vw, 2.5rem);
	}

	.chart-head {
		display: flex;
		align-items: stretch;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
		background: var(--bg);
		border: 1px solid var(--rule);
		border-bottom: 0;
		border-top-left-radius: 6px;
		border-top-right-radius: 6px;
		padding: 0.55rem;
	}

	.tabs {
		display: flex;
		gap: 0.4rem;
		flex-wrap: wrap;
	}

	.tab {
		background: transparent;
		border: 1px solid transparent;
		border-radius: 4px;
		padding: 0.45rem 0.85rem;
		text-align: left;
		cursor: pointer;
		color: var(--ink-soft);
		display: flex;
		flex-direction: column;
		gap: 0.18rem;
		transition: background 0.18s, color 0.18s, border-color 0.18s;
	}

	.tab:hover:not(:disabled) {
		color: var(--ink);
		background: var(--paper);
	}

	.tab.active {
		background: var(--paper);
		color: var(--ink);
		border-color: var(--rule-strong);
	}

	.tab:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	.tab-label {
		font-family: 'Overpass', sans-serif;
		font-weight: 600;
		font-size: 0.9rem;
		letter-spacing: -0.005em;
	}

	.tab-sub {
		font-family: 'Fira Mono', monospace;
		font-size: 0.66rem;
		color: var(--ink-faint);
	}

	.tab.active .tab-sub {
		color: var(--ink-soft);
	}

	.replay {
		align-self: center;
		background: transparent;
		border: 1px solid var(--rule-strong);
		color: var(--ink);
		padding: 0.45rem 0.85rem;
		border-radius: 4px;
		font-family: 'Fira Mono', monospace;
		font-size: 0.76rem;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		transition: border-color 0.18s, background 0.18s;
	}

	.replay:hover:not(:disabled) {
		border-color: var(--ink);
		background: var(--paper);
	}

	.replay:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.bars {
		background: var(--bg);
		border: 1px solid var(--rule);
		border-top: 0;
		padding: 1.4rem 1.4rem 0.6rem;
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
	}

	.bar-row {
		display: grid;
		grid-template-columns: minmax(11rem, 12rem) 1fr;
		gap: 1.2rem;
		align-items: center;
	}

	.bar-meta {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.bar-name {
		font-family: 'Fira Mono', monospace;
		font-size: 0.82rem;
		font-weight: 500;
		color: var(--ink);
	}

	.bar-sub {
		font-family: 'Fira Mono', monospace;
		font-size: 0.66rem;
		color: var(--ink-faint);
	}

	.bar-graph {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 0.85rem;
		align-items: center;
	}

	.bar-track {
		display: block;
		height: 12px;
		background: var(--paper);
		border: 1px solid var(--rule);
		border-radius: 999px;
		overflow: hidden;
	}

	.bar-fill {
		display: block;
		height: 100%;
		border-radius: inherit;
		transition: width 60ms linear;
	}

	.bar-js {
		background: linear-gradient(90deg, color-mix(in srgb, var(--ink-faint) 70%, transparent), var(--ink-faint));
	}

	.bar-rs {
		background: linear-gradient(90deg, var(--rust-soft), var(--rust));
	}

	.bar-rm {
		background: linear-gradient(90deg, var(--rust-soft), var(--svelte));
	}

	.bar-time {
		font-family: 'Fira Mono', monospace;
		font-size: 0.84rem;
		color: var(--ink);
		font-variant-numeric: tabular-nums;
		min-width: 5.5rem;
		text-align: right;
	}

	.chart-foot {
		background: var(--paper);
		border: 1px solid var(--rule);
		border-top: 0;
		border-bottom-left-radius: 6px;
		border-bottom-right-radius: 6px;
		padding: 0.7rem 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
		font-family: 'Fira Mono', monospace;
		font-size: 0.72rem;
		color: var(--ink-soft);
	}

	.speedup {
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
	}

	.speedup-k {
		color: var(--ink-faint);
		letter-spacing: 0.04em;
	}

	.speedup-v {
		font-family: 'Overpass', sans-serif;
		font-weight: 700;
		font-size: 0.92rem;
		color: var(--ink);
		font-variant-numeric: tabular-nums;
		display: inline-flex;
		align-items: baseline;
		gap: 0.45rem;
	}

	.speedup-v .x {
		font-family: 'Fira Mono', monospace;
		font-weight: 500;
		font-size: 0.72em;
		color: var(--rust);
	}

	.speedup-sep {
		color: var(--ink-faint);
	}

	.speedup-st {
		font-family: 'Fira Mono', monospace;
		font-weight: 400;
		font-size: 0.76rem;
		color: var(--ink-soft);
	}

	.missing {
		padding: 3rem 1.5rem;
		background: var(--bg);
		border: 1px solid var(--rule);
		border-top: 0;
		font-family: 'Fira Mono', monospace;
		font-size: 0.85rem;
		color: var(--ink-faint);
		text-align: center;
	}

	/* REPRO */
	.repro {
		max-width: 1080px;
		margin: 0 auto;
		padding: clamp(3.5rem, 7vh, 5rem) clamp(1rem, 4vw, 2.5rem) clamp(4rem, 8vh, 6rem);
	}

	.section-head {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.4rem 1.4rem;
		margin-bottom: 1.6rem;
		align-items: baseline;
	}

	.section-head .num {
		font-family: 'Fira Mono', monospace;
		font-size: 0.7rem;
		letter-spacing: 0.18em;
		color: var(--rust);
	}

	.section-head h2 {
		font-family: 'Overpass', sans-serif;
		font-weight: 700;
		font-size: clamp(1.6rem, 3vw, 2.4rem);
		line-height: 1.1;
		letter-spacing: -0.022em;
		margin: 0;
		color: var(--ink);
	}

	.diff {
		max-width: 720px;
		background: var(--paper);
		border: 1px solid var(--rule);
		border-radius: 6px;
		overflow: hidden;
		font-family: 'Fira Mono', monospace;
	}

	.diff figcaption {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.65rem 1rem;
		border-bottom: 1px solid var(--rule);
		font-size: 0.72rem;
		color: var(--ink-faint);
		letter-spacing: 0.04em;
	}

	.diff-file {
		color: var(--ink-soft);
	}

	.diff pre {
		margin: 0;
		padding: 1rem 1.2rem;
		font-size: 0.85rem;
		line-height: 1.7;
	}

	.c-cmt {
		color: var(--ink-faint);
	}

	.c-prompt {
		color: var(--svelte);
		margin-right: 0.5em;
	}

	.c-flag,
	.c-op {
		color: var(--rust);
	}

	/* EMPTY */
	.empty {
		max-width: 1080px;
		margin: 0 auto;
		padding: clamp(4rem, 10vh, 7rem) clamp(1rem, 4vw, 2.5rem);
	}

	.empty h1 {
		font-family: 'Overpass', sans-serif;
		font-weight: 700;
		font-size: clamp(2rem, 4.6vw, 3rem);
		line-height: 1.05;
		letter-spacing: -0.025em;
		color: var(--ink);
		margin: 0 0 1rem;
	}

	.empty .lede {
		font-size: 1.05rem;
		color: var(--ink-soft);
		max-width: 56ch;
		margin: 0 0 1.5rem;
	}

	.empty-code {
		max-width: 640px;
		background: var(--paper);
		border: 1px solid var(--rule);
		border-radius: 6px;
		padding: 1rem 1.2rem;
		font-family: 'Fira Mono', monospace;
		font-size: 0.85rem;
		color: var(--ink);
		line-height: 1.7;
		overflow-x: auto;
	}

	/* RESPONSIVE */
	@media (max-width: 880px) {
		.stats {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 640px) {
		.stats {
			grid-template-columns: 1fr;
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
		.chart-head {
			flex-direction: column;
		}
		.replay {
			align-self: flex-end;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.bar-fill {
			transition: none !important;
		}
	}
</style>
