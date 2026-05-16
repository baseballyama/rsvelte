<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import type { PageData } from './$types';
	import type { BenchmarkTaskResults } from '$lib/types/benchmark';

	let { data }: { data: PageData } = $props();

	type TabId = 'full' | 'parse' | 'svelte2tsx';

	let activeTab = $state<TabId>('full');
	let animationTime = $state(0);
	let isAnimating = $state(false);
	let animationComplete = $state(false);

	const ANIMATION_DURATION_MS = 2200;

	const tabMeta: Record<TabId, { label: string; sub: string }> = {
		full: { label: 'Full pipeline', sub: 'parse → analyze → codegen' },
		parse: { label: 'Parser only', sub: 'phase 1, isolated' },
		svelte2tsx: { label: 'svelte2tsx', sub: '.svelte → .tsx generation' }
	};

	const TABS: TabId[] = ['full', 'parse', 'svelte2tsx'];

	const formatDate = (iso: string): string =>
		new Date(iso).toLocaleString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});

	const formatDuration = (ms: number): string => {
		if (ms < 1) return `${(ms * 1000).toFixed(1)}μs`;
		if (ms < 1000) return `${ms.toFixed(1)}ms`;
		return `${(ms / 1000).toFixed(2)}s`;
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
		const targetWidth = (duration / maxDuration) * 100;
		if (animationComplete) return targetWidth;
		const scale = maxDuration / ANIMATION_DURATION_MS;
		const simulated = animationTime * scale;
		if (simulated >= duration) return targetWidth;
		return (simulated / maxDuration) * 100;
	};

	const getAnimatedTime = (r: BenchmarkTaskResults, duration: number): number => {
		if (animationComplete) return duration;
		const maxDuration = getMaxDuration(r);
		const scale = maxDuration / ANIMATION_DURATION_MS;
		const simulated = animationTime * scale;
		return Math.min(simulated, duration);
	};

	const isBarComplete = (r: BenchmarkTaskResults, duration: number): boolean => {
		if (animationComplete) return true;
		const maxDuration = getMaxDuration(r);
		const scale = maxDuration / ANIMATION_DURATION_MS;
		return animationTime * scale >= duration;
	};

	const startAnimation = () => {
		if (isAnimating || !data.results) return;
		isAnimating = true;
		animationComplete = false;
		animationTime = 0;
		const start = performance.now();
		const tick = () => {
			const elapsed = performance.now() - start;
			animationTime = elapsed;
			if (elapsed >= ANIMATION_DURATION_MS) {
				animationTime = ANIMATION_DURATION_MS;
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
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400;1,700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="page">
	<nav class="nav">
		<a href="{base}/" class="brand" aria-label="rsvelte home">
			<span class="brand-icon" aria-hidden="true">
				<svg viewBox="0 0 24 24" width="22" height="22" fill="none">
					<path d="M19 8 13 18l-2-4 6-10 2 4Z" fill="#ff3e00" />
					<path d="M5 16 11 6l2 4-6 10-2-4Z" fill="#ce422b" />
				</svg>
			</span>
			<span class="brand-text">rsvelte</span>
			<span class="brand-tag">rust port</span>
		</a>
		<div class="nav-links">
			<a href="{base}/playground">Playground</a>
			<a href="{base}/progress">Compatibility</a>
			<a href="{base}/benchmark" class="active">Benchmark</a>
			<a
				href="https://github.com/baseballyama/rsvelte"
				target="_blank"
				rel="noopener"
				class="gh"
			>
				GitHub
				<span aria-hidden="true">↗</span>
			</a>
		</div>
	</nav>

	{#if data.error}
		<section class="empty">
			<p class="eyebrow">Benchmark · unavailable</p>
			<h1>No benchmark data yet.</h1>
			<p class="lede">{data.error}</p>
			<pre class="empty-code"><code><span class="c-cmt"># From the repo root</span>
<span class="c-prompt">$</span> cargo build --release
<span class="c-prompt">$</span> node scripts/run-benchmark.mjs &gt; docs/static/benchmark-results.json</code></pre>
		</section>
	{:else if data.results}
		{@const r = data.results}
		{@const task = activeTask}

		<!-- Single-viewport dashboard. Everything you need is right here. -->
		<main class="dash">
			<header class="dash-head">
				<div class="dash-title">
					<p class="eyebrow">
						<span class="rule-h"></span>
						Compilation speed
					</p>
					<h1>
						<span class="ink-svelte">{r.speedup.multiThreadVsJs.toFixed(1)}×</span>
						faster than <code>svelte/compiler</code>.
					</h1>
				</div>

				<dl class="dash-meta">
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

			<!-- Top stats: the only numbers most readers need. -->
			<section class="stats">
				<article class="stat stat-accent">
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
				<article class="stat stat-quiet">
					<span class="stat-k">Parser alone</span>
					<span class="stat-n">
						{r.parse.speedup.multiThreadVsJs.toFixed(0)}<span class="stat-x">×</span>
					</span>
					<span class="stat-s">phase 1, isolated</span>
				</article>
			</section>

			<!-- Tabbed chart — three benchmarks in one viewport. -->
			<section class="chart-card">
				<header class="chart-head">
					<div class="tabs" role="tablist" aria-label="Benchmark task">
						{#each TABS as tab (tab)}
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
					<div class="chart">
						{#each [
							{ name: 'JavaScript', sub: 'svelte/compiler', dur: t.javascript.durationMs, tone: 'js' },
							{ name: 'Rust · single', sub: 'no parallelism', dur: t.rustSingleThread.durationMs, tone: 'rs' },
							{ name: 'Rust · multi', sub: 'rayon fan-out', dur: t.rustMultiThread.durationMs, tone: 'rm' }
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
											class:complete={isBarComplete(t, bar.dur)}
											style="width: {getAnimatedWidth(t, bar.dur)}%;"
										></span>
									</span>
									<span class="bar-time" class:complete={isBarComplete(t, bar.dur)}>
										{formatDuration(getAnimatedTime(t, bar.dur))}
									</span>
								</div>
							</div>
						{/each}
					</div>

					<footer class="chart-foot">
						<span class="hint">Lower is better · same machine, same corpus</span>
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
		</main>

		<!-- Reproduce — scrolls into view, doesn't crowd the dashboard. -->
		<section class="repro">
			<div class="repro-head">
				<span class="num">02</span>
				<h2>Reproduce it yourself.</h2>
			</div>
			<figure class="diff">
				<figcaption>
					<span>your-shell</span>
					<span class="diff-tag">bash</span>
				</figcaption>
				<pre><code><span class="c-cmt"># 1. Build the Rust compiler in release mode</span>
<span class="line"><span class="c-prompt">$</span> cargo build <span class="c-flag">--release</span></span>

<span class="c-cmt"># 2. Run the corpus benchmark</span>
<span class="line"><span class="c-prompt">$</span> node scripts/run-benchmark.mjs <span class="c-op">&gt;</span> docs/static/benchmark-results.json</span>

<span class="c-cmt"># 3. View the report locally</span>
<span class="line"><span class="c-prompt">$</span> cd docs <span class="c-op">&amp;&amp;</span> pnpm dev</span></code></pre>
			</figure>
		</section>
	{/if}
</div>

<style>
	.page {
		--bg: #fdfcfa;
		--surface: #f6f3ed;
		--surface-2: #efeae0;
		--ink: #15140f;
		--ink-soft: #57534d;
		--ink-faint: #908a80;
		--rule: #e7e2d6;
		--rule-strong: #c8c0b0;
		--svelte: #ff3e00;
		--rust: #ce422b;
		--accent-deep: #b8350c;

		--bar-js: #c79100;
		--bar-rs: #ce422b;
		--bar-rm: #ff3e00;

		--sans:
			'Atkinson Hyperlegible', ui-sans-serif, -apple-system, BlinkMacSystemFont,
			'Helvetica Neue', sans-serif;
		--mono: 'IBM Plex Mono', ui-monospace, 'SF Mono', Menlo, monospace;

		background: var(--bg);
		color: var(--ink);
		font-family: var(--sans);
		font-size: 16px;
		line-height: 1.55;
		min-height: 100vh;
		-webkit-font-smoothing: antialiased;
	}

	:global(body) {
		margin: 0;
	}

	code {
		font-family: var(--mono);
	}

	/* ============================================================
	   NAV (mirrors landing)
	   ============================================================ */
	.nav {
		position: sticky;
		top: 0;
		z-index: 30;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 2rem;
		padding: 0.85rem clamp(1rem, 3vw, 2.25rem);
		background: rgba(253, 252, 250, 0.92);
		border-bottom: 1px solid var(--rule);
		backdrop-filter: saturate(160%) blur(8px);
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		text-decoration: none;
		color: var(--ink);
	}

	.brand-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 26px;
		height: 26px;
	}

	.brand-text {
		font-weight: 700;
		font-size: 1.05rem;
		letter-spacing: -0.01em;
	}

	.brand-tag {
		font-family: var(--mono);
		font-size: 0.66rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--rust);
		padding: 0.18rem 0.5rem;
		border: 1px solid currentColor;
		border-radius: 999px;
		line-height: 1;
		margin-left: 0.25rem;
		opacity: 0.85;
	}

	.nav-links {
		display: flex;
		align-items: center;
		gap: clamp(0.75rem, 2vw, 1.6rem);
		font-size: 0.9rem;
		font-weight: 500;
	}

	.nav-links a {
		color: var(--ink-soft);
		text-decoration: none;
		padding: 0.25rem 0;
		border-bottom: 1px solid transparent;
		transition:
			color 0.18s,
			border-color 0.18s;
	}

	.nav-links a:hover,
	.nav-links a.active {
		color: var(--svelte);
		border-bottom-color: var(--svelte);
	}

	.nav-links .gh {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
	}

	/* ============================================================
	   DASHBOARD — fits a 13" laptop without scrolling
	   ============================================================ */
	.dash {
		max-width: 1280px;
		margin: 0 auto;
		padding: clamp(1.5rem, 3.5vh, 2.25rem) clamp(1rem, 3vw, 2.25rem) clamp(1.25rem, 2.5vh, 1.75rem);
		display: grid;
		gap: clamp(1.1rem, 2.5vh, 1.6rem);
	}

	.dash-head {
		display: grid;
		grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
		gap: 2rem;
		align-items: end;
	}

	.dash-title h1 {
		font-family: var(--sans);
		font-weight: 700;
		font-size: clamp(1.65rem, 3vw, 2.45rem);
		line-height: 1.1;
		letter-spacing: -0.022em;
		margin: 0;
		color: var(--ink);
	}

	.dash-title h1 code {
		font-size: 0.6em;
		background: var(--surface);
		padding: 0.05em 0.4em;
		border-radius: 4px;
		border: 1px solid var(--rule);
		font-weight: 500;
		color: var(--ink);
		vertical-align: 0.06em;
	}

	.ink-svelte {
		color: var(--svelte);
	}

	.eyebrow {
		font-family: var(--mono);
		font-size: 0.75rem;
		letter-spacing: 0.06em;
		color: var(--rust);
		margin: 0 0 0.7rem;
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
	}

	.rule-h {
		display: inline-block;
		width: 22px;
		height: 1px;
		background: currentColor;
	}

	.dash-meta {
		display: flex;
		gap: clamp(1rem, 2vw, 1.75rem);
		margin: 0;
		justify-self: end;
		text-align: right;
	}

	.dash-meta > div {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.dash-meta dt {
		font-family: var(--mono);
		font-size: 0.65rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}

	.dash-meta dd {
		font-family: var(--mono);
		font-size: 0.78rem;
		color: var(--ink);
		margin: 0;
	}

	.dash-meta dd code {
		font: inherit;
	}

	/* ============================================================
	   STAT CARDS
	   ============================================================ */
	.stats {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0;
		border: 1px solid var(--rule);
		border-radius: 10px;
		overflow: hidden;
		background: var(--bg);
	}

	.stat {
		padding: clamp(0.85rem, 1.8vh, 1.25rem) clamp(0.9rem, 1.5vw, 1.4rem);
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		border-left: 1px solid var(--rule);
	}

	.stat:first-child {
		border-left: none;
	}

	.stat-accent {
		background: var(--ink);
		color: #ede8d8;
	}

	.stat-quiet {
		background: var(--surface);
	}

	.stat-k {
		font-family: var(--mono);
		font-size: 0.66rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}

	.stat-accent .stat-k {
		color: rgba(237, 232, 216, 0.65);
	}

	.stat-n {
		font-family: var(--sans);
		font-weight: 700;
		font-size: clamp(1.9rem, 3.3vw, 2.6rem);
		line-height: 1;
		letter-spacing: -0.035em;
		color: var(--ink);
		font-variant-numeric: tabular-nums;
		display: inline-flex;
		align-items: baseline;
	}

	.stat-accent .stat-n {
		color: #fff;
	}

	.stat-n .stat-x {
		font-family: var(--mono);
		font-weight: 500;
		font-size: 0.4em;
		margin-left: 0.18em;
		color: var(--svelte);
		letter-spacing: 0.02em;
	}

	.stat-accent .stat-n .stat-x {
		color: var(--svelte);
	}

	.stat-s {
		font-family: var(--mono);
		font-size: 0.7rem;
		color: var(--ink-soft);
		letter-spacing: 0.02em;
	}

	.stat-accent .stat-s {
		color: rgba(237, 232, 216, 0.55);
	}

	/* ============================================================
	   CHART CARD
	   ============================================================ */
	.chart-card {
		background: var(--bg);
		border: 1px solid var(--rule);
		border-radius: 10px;
		overflow: hidden;
	}

	.chart-head {
		display: flex;
		justify-content: space-between;
		align-items: stretch;
		border-bottom: 1px solid var(--rule);
		gap: 1rem;
	}

	.tabs {
		display: flex;
		gap: 0;
		flex: 1;
	}

	.tab {
		appearance: none;
		background: transparent;
		border: none;
		border-right: 1px solid var(--rule);
		padding: 0.85rem 1.1rem;
		cursor: pointer;
		text-align: left;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		font-family: var(--sans);
		color: var(--ink-soft);
		position: relative;
		min-width: 8.5rem;
		transition:
			background 0.18s,
			color 0.18s;
	}

	.tab:hover:not(:disabled) {
		background: var(--surface);
		color: var(--ink);
	}

	.tab.active {
		background: var(--bg);
		color: var(--ink);
	}

	.tab.active::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: -1px;
		height: 2px;
		background: var(--svelte);
	}

	.tab:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}

	.tab-label {
		font-weight: 700;
		font-size: 0.92rem;
		letter-spacing: -0.01em;
	}

	.tab-sub {
		font-family: var(--mono);
		font-size: 0.66rem;
		color: var(--ink-faint);
	}

	.tab.active .tab-sub {
		color: var(--ink-soft);
	}

	.replay {
		appearance: none;
		background: transparent;
		border: none;
		border-left: 1px solid var(--rule);
		padding: 0 1.2rem;
		font-family: var(--mono);
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--ink-soft);
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		transition:
			color 0.18s,
			background 0.18s;
	}

	.replay:hover:not(:disabled) {
		color: var(--ink);
		background: var(--surface);
	}

	.replay:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.replay-i {
		font-family: var(--mono);
		display: inline-block;
		font-size: 1rem;
		transition: transform 0.4s;
	}

	.replay:hover:not(:disabled) .replay-i {
		transform: rotate(180deg);
	}

	.chart {
		padding: clamp(1rem, 2vh, 1.4rem) clamp(1rem, 2vw, 1.5rem);
		display: flex;
		flex-direction: column;
		gap: clamp(0.7rem, 1.4vh, 1rem);
	}

	.bar-row {
		display: grid;
		grid-template-columns: minmax(8.5rem, 11rem) 1fr;
		gap: clamp(0.75rem, 2vw, 1.5rem);
		align-items: center;
	}

	.bar-meta {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}

	.bar-name {
		font-weight: 700;
		font-size: 0.95rem;
		color: var(--ink);
		letter-spacing: -0.01em;
	}

	.bar-sub {
		font-family: var(--mono);
		font-size: 0.68rem;
		color: var(--ink-soft);
		letter-spacing: 0.02em;
	}

	.bar-graph {
		display: flex;
		align-items: center;
		gap: 0.9rem;
	}

	.bar-track {
		flex: 1;
		height: 16px;
		background: var(--surface-2);
		border-radius: 3px;
		position: relative;
		overflow: hidden;
		display: block;
	}

	.bar-fill {
		position: absolute;
		inset: 0;
		width: 0;
		border-radius: 3px;
		opacity: 0.9;
		transition: opacity 0.3s;
	}

	.bar-fill.complete {
		opacity: 1;
	}

	.bar-js {
		background: var(--bar-js);
	}
	.bar-rs {
		background: var(--bar-rs);
	}
	.bar-rm {
		background: var(--bar-rm);
	}

	.bar-time {
		font-family: var(--sans);
		font-feature-settings: 'tnum' 1, 'lnum' 1;
		font-weight: 700;
		font-size: clamp(1rem, 1.5vw, 1.25rem);
		letter-spacing: -0.015em;
		color: var(--ink-faint);
		min-width: 5.5rem;
		text-align: right;
		font-variant-numeric: tabular-nums;
		transition: color 0.3s;
	}

	.bar-time.complete {
		color: var(--ink);
	}

	.chart-foot {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem clamp(1rem, 2vw, 1.5rem);
		border-top: 1px solid var(--rule);
		background: var(--surface);
		font-family: var(--mono);
		font-size: 0.74rem;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.hint {
		color: var(--ink-soft);
	}

	.speedup {
		display: inline-flex;
		align-items: baseline;
		gap: 0.5rem;
	}

	.speedup-k {
		color: var(--ink-faint);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		font-size: 0.66rem;
	}

	.speedup-v {
		font-family: var(--sans);
		font-weight: 700;
		color: var(--svelte);
		font-size: 1rem;
		letter-spacing: -0.01em;
	}

	.speedup-v .x {
		font-family: var(--mono);
		font-weight: 500;
		font-size: 0.7em;
		margin-left: 0.1em;
	}

	.speedup-sep {
		color: var(--ink-faint);
		margin: 0 0.3em;
		font-weight: 400;
	}

	.speedup-st {
		font-family: var(--mono);
		color: var(--ink-soft);
		font-weight: 500;
		font-size: 0.8em;
	}

	.missing {
		padding: 2rem;
		text-align: center;
		color: var(--ink-soft);
	}

	/* ============================================================
	   REPRODUCE
	   ============================================================ */
	.repro {
		max-width: 1280px;
		margin: 0 auto;
		padding: clamp(3rem, 6vh, 5rem) clamp(1rem, 3vw, 2.25rem);
		border-top: 1px solid var(--rule);
	}

	.repro-head {
		display: flex;
		align-items: baseline;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.repro-head .num {
		font-family: var(--mono);
		font-size: 0.72rem;
		letter-spacing: 0.18em;
		color: var(--rust);
	}

	.repro-head h2 {
		font-family: var(--sans);
		font-weight: 700;
		font-size: clamp(1.4rem, 2.4vw, 2rem);
		letter-spacing: -0.022em;
		margin: 0;
		color: var(--ink);
	}

	.diff {
		margin: 0;
		max-width: 780px;
		background: var(--ink);
		color: #ede8d8;
		border-radius: 10px;
		font-family: var(--mono);
		overflow: hidden;
		border: 1px solid #2a2620;
		box-shadow: 0 12px 28px -20px rgba(21, 20, 15, 0.5);
	}

	.diff figcaption {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.7rem 1rem;
		border-bottom: 1px solid rgba(237, 232, 216, 0.08);
		font-size: 0.7rem;
		letter-spacing: 0.08em;
		color: rgba(237, 232, 216, 0.55);
		text-transform: uppercase;
	}

	.diff .diff-tag {
		color: var(--svelte);
	}

	.diff pre {
		margin: 0;
		padding: 1.1rem 1.25rem;
		font-size: 0.85rem;
		line-height: 1.7;
		white-space: pre-wrap;
	}

	.diff code {
		font-family: inherit;
	}

	.diff .line {
		display: block;
	}

	.c-cmt {
		color: rgba(237, 232, 216, 0.4);
		display: block;
	}

	.c-prompt {
		color: var(--svelte);
		margin-right: 0.5em;
	}

	.c-flag {
		color: #ffb380;
	}

	.c-op {
		color: rgba(237, 232, 216, 0.5);
	}

	/* ============================================================
	   EMPTY STATE
	   ============================================================ */
	.empty {
		max-width: 720px;
		padding: clamp(3rem, 8vh, 5rem) clamp(1rem, 3vw, 2.25rem);
		margin: 0 auto;
	}

	.empty h1 {
		font-family: var(--sans);
		font-weight: 700;
		font-size: clamp(1.8rem, 3.5vw, 2.6rem);
		letter-spacing: -0.022em;
		margin: 0 0 1rem;
	}

	.empty .lede {
		font-size: 1.05rem;
		color: var(--ink-soft);
		margin: 0 0 1.5rem;
	}

	.empty-code {
		font-family: var(--mono);
		background: var(--ink);
		color: #ede8d8;
		padding: 1.1rem 1.25rem;
		border-radius: 10px;
		font-size: 0.85rem;
		line-height: 1.7;
		border: 1px solid #2a2620;
	}

	/* ============================================================
	   RESPONSIVE
	   ============================================================ */
	@media (max-width: 1000px) {
		.dash-head {
			grid-template-columns: 1fr;
			gap: 1rem;
		}
		.dash-meta {
			justify-self: start;
			text-align: left;
		}
		.stats {
			grid-template-columns: repeat(2, 1fr);
		}
		/* 3rd card starts a new row in 2-col layout */
		.stat + .stat + .stat {
			border-left: none;
			border-top: 1px solid var(--rule);
		}
		/* 4th card */
		.stat + .stat + .stat + .stat {
			border-top: 1px solid var(--rule);
		}
	}

	@media (max-width: 700px) {
		.brand-tag {
			display: none;
		}
		.nav-links {
			gap: 0.85rem;
			font-size: 0.82rem;
		}
		.stats {
			grid-template-columns: 1fr;
		}
		.stat {
			border-left: none;
			border-top: 1px solid var(--rule);
		}
		.stat:first-child {
			border-top: none;
		}
		.chart-head {
			flex-direction: column;
			align-items: stretch;
		}
		.tabs {
			overflow-x: auto;
		}
		.replay {
			border-left: none;
			border-top: 1px solid var(--rule);
			padding: 0.65rem 1rem;
			justify-content: center;
		}
		.bar-row {
			grid-template-columns: 1fr;
			gap: 0.5rem;
		}
		.bar-time {
			min-width: 4rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.bar-fill {
			transition: none !important;
		}
		.replay-i {
			transition: none !important;
		}
	}
</style>
