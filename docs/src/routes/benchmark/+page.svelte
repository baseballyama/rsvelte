<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import type { BenchmarkTaskResults } from '$lib/types/benchmark';
	import SiteNav from '$lib/components/SiteNav.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';

	let { data }: { data: PageData } = $props();

	type TaskId = 'full' | 'parse' | 'svelte2tsx' | 'svelte-check';

	// `animationTime` is the elapsed wall-clock ms since the run started.
	// Each bar across every task shows `min(animationTime, this.durationMs)`,
	// so all three breakdowns fill in parallel at their *actual* measured
	// speeds — the slow JS bar is still inching forward when the multi-
	// threaded rsvelte bar has already crossed the finish line.
	let animationTime = $state(0);
	let isAnimating = $state(false);
	let animationComplete = $state(false);

	// Hard ceiling for the wall-clock animation so very fast tasks (e.g. the
	// parser-only run can finish in ~150 ms) don't blink past unreadably and
	// very slow ones (full-pipeline JS at ~1 s) don't drag the user. We stop
	// once the slowest bar across every task is done OR 4 s, whichever
	// comes first.
	const ANIMATION_HARD_CAP_MS = 4000;

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

	type TaskPanel = {
		id: TaskId;
		label: string;
		sub: string;
		data: BenchmarkTaskResults;
		filesCount?: number;
	};

	const tasks: TaskPanel[] = $derived.by(() => {
		if (!data.results) return [];
		const r = data.results;
		const list: TaskPanel[] = [
			{ id: 'full', label: 'Full pipeline', sub: 'parse / analyze / codegen', data: r },
			{ id: 'parse', label: 'Parser only', sub: 'phase 1, isolated', data: r.parse }
		];
		if (r.svelte2tsx) {
			list.push({
				id: 'svelte2tsx',
				label: 'svelte2tsx',
				sub: '.svelte / .tsx generation',
				data: r.svelte2tsx
			});
		}
		if (r.svelteCheck) {
			list.push({
				id: 'svelte-check',
				label: 'svelte-check',
				sub: `CLI · ${r.svelteCheck.filesCount.toLocaleString('en-US')}-file workspace`,
				data: r.svelteCheck,
				filesCount: r.svelteCheck.filesCount
			});
		}
		return list;
	});

	const headlineSpeedups: { id: TaskId; label: string; sub: string; x: number; precision: number }[] = $derived(
		tasks.map((t) => ({
			id: t.id,
			label: t.label,
			sub: t.sub,
			x: t.data.speedup.multiThreadVsJs,
			precision: t.data.speedup.multiThreadVsJs >= 50 ? 0 : 1
		}))
	);

	const maxHeadlineSpeedup = $derived(
		headlineSpeedups.reduce((m, s) => Math.max(m, s.x), 0)
	);

	const getMaxDuration = (r: BenchmarkTaskResults): number =>
		Math.max(r.javascript.durationMs, r.rustSingleThread.durationMs, r.rustMultiThread.durationMs);

	const getAnimatedWidth = (r: BenchmarkTaskResults, duration: number): number => {
		const maxDuration = getMaxDuration(r);
		if (animationComplete) return (duration / maxDuration) * 100;
		const filled = Math.min(animationTime, duration);
		return (filled / maxDuration) * 100;
	};

	const getAnimatedTime = (duration: number): number => {
		if (animationComplete) return duration;
		return Math.min(animationTime, duration);
	};

	const startAnimation = () => {
		if (isAnimating || tasks.length === 0) return;
		isAnimating = true;
		animationComplete = false;
		animationTime = 0;
		// Run until the slowest bar across *every* visible task is done,
		// so users still see fast bars finish early and the slow JS bar
		// crawl on.
		const slowest = Math.max(...tasks.map((t) => getMaxDuration(t.data)));
		const finishAt = Math.min(slowest, ANIMATION_HARD_CAP_MS);
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

		<header class="hero">
			<p class="eyebrow">
				<span class="rule"></span>Across the Svelte toolchain · multi-threaded vs official JS
			</p>

			<h1 class="title">
				Up to <span class="ink-svelte">{maxHeadlineSpeedup.toFixed(0)}×</span> faster across the
				Svelte toolchain.
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
			{#each headlineSpeedups as s, i (s.id)}
				<article class="stat" class:stat-hero={i === 0}>
					<span class="stat-k">{s.label}</span>
					<span class="stat-n">
						{s.x.toFixed(s.precision)}<span class="stat-x">×</span>
					</span>
					<span class="stat-s">{s.sub}</span>
				</article>
			{/each}
		</section>

		<section class="chart">
			<header class="chart-head">
				<div class="chart-head-meta">
					<h2 class="chart-title">Per-phase breakdown</h2>
					<p class="chart-sub">Lower is better · same machine, same corpus</p>
				</div>
				<button class="replay" onclick={startAnimation} disabled={isAnimating}>
					<span class="replay-i" aria-hidden="true">↻</span>
					Replay
				</button>
			</header>

			<div class="task-panels">
				{#each tasks as task (task.id)}
					{@const t = task.data}
					<article class="task-panel">
						<header class="task-panel-head">
							<div class="task-panel-meta">
								<span class="task-panel-label">{task.label}</span>
								<span class="task-panel-sub">{task.sub}</span>
							</div>
							<span class="task-panel-speedup">
								<span class="task-panel-speedup-k">multi · </span>
								<span class="task-panel-speedup-n">
									{t.speedup.multiThreadVsJs.toFixed(1)}<span class="x">×</span>
								</span>
								<span class="task-panel-speedup-sep">·</span>
								<span class="task-panel-speedup-st">
									single {t.speedup.singleThreadVsJs.toFixed(1)}×
								</span>
							</span>
						</header>
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
											{formatDuration(getAnimatedTime(bar.dur))}
										</span>
									</div>
								</div>
							{/each}
						</div>
					</article>
				{/each}
			</div>
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
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
		padding: 0 0.1rem 1rem;
	}

	.chart-head-meta {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.chart-title {
		font-family: 'Overpass', sans-serif;
		font-weight: 700;
		font-size: clamp(1.2rem, 2.2vw, 1.5rem);
		line-height: 1.1;
		letter-spacing: -0.015em;
		color: var(--ink);
		margin: 0;
	}

	.chart-sub {
		font-family: 'Fira Mono', monospace;
		font-size: 0.72rem;
		color: var(--ink-soft);
		margin: 0;
	}

	.task-panels {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.task-panel {
		background: var(--bg);
		border: 1px solid var(--rule);
		border-radius: 6px;
		overflow: hidden;
	}

	.task-panel-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
		padding: 0.9rem 1.2rem;
		background: var(--paper);
		border-bottom: 1px solid var(--rule);
	}

	.task-panel-meta {
		display: flex;
		flex-direction: column;
		gap: 0.18rem;
	}

	.task-panel-label {
		font-family: 'Overpass', sans-serif;
		font-weight: 700;
		font-size: 0.98rem;
		color: var(--ink);
		letter-spacing: -0.005em;
	}

	.task-panel-sub {
		font-family: 'Fira Mono', monospace;
		font-size: 0.7rem;
		color: var(--ink-faint);
	}

	.task-panel-speedup {
		display: inline-flex;
		align-items: baseline;
		gap: 0.4rem;
		font-family: 'Fira Mono', monospace;
		font-size: 0.72rem;
		color: var(--ink-soft);
	}

	.task-panel-speedup-k {
		color: var(--ink-faint);
		letter-spacing: 0.04em;
	}

	.task-panel-speedup-n {
		font-family: 'Overpass', sans-serif;
		font-weight: 700;
		font-size: 0.95rem;
		color: var(--rust);
		font-variant-numeric: tabular-nums;
		display: inline-flex;
		align-items: baseline;
	}

	.task-panel-speedup-n .x {
		font-family: 'Fira Mono', monospace;
		font-weight: 500;
		font-size: 0.72em;
		margin-left: 0.06em;
		color: var(--rust);
		opacity: 0.75;
	}

	.task-panel-speedup-sep {
		color: var(--ink-faint);
	}

	.task-panel-speedup-st {
		font-family: 'Fira Mono', monospace;
		font-size: 0.74rem;
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
		padding: 1.1rem 1.2rem 1.2rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
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
			align-items: flex-start;
		}
		.replay {
			align-self: flex-end;
		}
		.task-panel-head {
			flex-direction: column;
			align-items: flex-start;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.bar-fill {
			transition: none !important;
		}
	}
</style>
