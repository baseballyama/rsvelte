<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import type { PageData } from './$types';
	import type { BenchmarkTaskResults } from '$lib/types/benchmark';

	let { data }: { data: PageData } = $props();

	let animationTime = $state(0);
	let isAnimating = $state(false);
	let animationComplete = $state(false);

	const ANIMATION_DURATION_MS = 2600;

	const formatDate = (iso: string): string =>
		new Date(iso).toLocaleString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});

	const formatDuration = (ms: number): string => {
		if (ms < 1) return `${(ms * 1000).toFixed(2)}μs`;
		if (ms < 1000) return `${ms.toFixed(2)}ms`;
		return `${(ms / 1000).toFixed(2)}s`;
	};

	const formatThroughput = (v: number): string => {
		if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
		return v.toFixed(1);
	};

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

	onMount(() => {
		if (data.results) setTimeout(startAnimation, 500);
	});
</script>

<svelte:head>
	<title>Speed · rsvelte</title>
	<meta
		name="description"
		content="Compilation speed benchmark — rsvelte (Rust, single + multi-threaded) against the official svelte/compiler."
	/>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,200..900,0..100,0..1;1,9..144,200..900,0..100,0..1&family=Instrument+Sans:ital,wght@0,400..700;1,400..700&family=JetBrains+Mono:wght@400..700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="page">
	<div class="grain" aria-hidden="true"></div>
	<div class="spine" aria-hidden="true"></div>

	<nav class="strip">
		<div class="strip-l">
			<a href="{base}/" class="mark">rsvelte</a>
		</div>
		<div class="strip-r">
			<a href="{base}/playground">Playground</a>
			<a href="{base}/progress">Compat</a>
			<a href="{base}/benchmark" class="active">Speed</a>
			<a
				href="https://github.com/baseballyama/rsvelte"
				target="_blank"
				rel="noopener"
				class="ext">GitHub <span class="chev">↗</span></a
			>
		</div>
	</nav>

	{#if data.error}
		<section class="empty">
			<span class="kicker">§ Speed — unavailable</span>
			<h1 class="empty-title"><em>Benchmark</em> not<br />generated.</h1>
			<p class="empty-sub">{data.error}</p>
			<pre class="empty-code"><code># From the repo root
cargo build --release
node scripts/run-benchmark.mjs &gt; docs/static/benchmark-results.json</code></pre>
		</section>
	{:else if data.results}
		{@const r = data.results}
		<!-- HERO -->
		<header class="hero">
			<aside class="margin margin-tl" aria-hidden="true">
				<span class="serif-italic">№ 003</span>
				<span class="rule"></span>
				<span class="meta">The speed report</span>
			</aside>

			<aside class="margin margin-tr" aria-hidden="true">
				<span class="meta">Recorded</span><br />
				<span class="strong mono">{formatDate(r.generatedAt)}</span><br />
				<span class="meta">Corpus</span><br />
				<span class="strong mono"
					>{r.testFilesCount.toLocaleString('en-US')} .svelte files</span
				>
			</aside>

			<div class="hero-figure" aria-hidden="true">
				<span class="num">{r.speedup.multiThreadVsJs.toFixed(0)}</span>
				<span class="x">×</span>
			</div>

			<h1 class="hero-title">
				<span class="line">Faster</span>
				<span class="line"><em>than</em></span>
				<span class="line">JavaScript.</span>
			</h1>

			<dl class="hero-stats">
				<div>
					<dt>Multi-threaded</dt>
					<dd>
						<span class="big">{r.speedup.multiThreadVsJs.toFixed(1)}<span class="x">×</span></span>
						<span class="dim">vs svelte/compiler</span>
					</dd>
				</div>
				<div>
					<dt>Single-threaded</dt>
					<dd>
						<span class="big">{r.speedup.singleThreadVsJs.toFixed(1)}<span class="x">×</span></span>
						<span class="dim">no parallelism</span>
					</dd>
				</div>
				<div>
					<dt>Throughput</dt>
					<dd>
						<span class="big">{formatThroughput(r.rustMultiThread.throughputFilesPerSec)}<span class="x">/s</span></span>
						<span class="dim">files compiled per second</span>
					</dd>
				</div>
			</dl>
		</header>

		<!-- CHART -->
		<section class="spec">
			<header class="spec-head">
				<div class="spec-head-line">
					<div>
						<span class="kicker">§ 02 — Compilation</span>
						<h2><em>Lower</em> is better.</h2>
					</div>
					<button class="replay" onclick={startAnimation} disabled={isAnimating}>
						<span class="replay-chev">↻</span> Replay
					</button>
				</div>
				<p class="lede">
					Total wall-clock time to compile the entire <span class="chip">{r.testFilesCount.toLocaleString('en-US')}</span>
					fixture corpus on the same machine. Same source → same output.
				</p>
			</header>

			<div class="chart">
				{#each [
					{ name: 'JavaScript', sub: 'svelte/compiler', dur: r.javascript.durationMs, tone: 'js' },
					{ name: 'Rust · single', sub: 'no parallelism', dur: r.rustSingleThread.durationMs, tone: 'rs' },
					{ name: 'Rust · multi', sub: 'rayon fan-out', dur: r.rustMultiThread.durationMs, tone: 'rm' }
				] as bar, i (bar.name)}
					<article class="chart-row" style="--i: {i};">
						<div class="row-meta">
							<strong>{bar.name}</strong>
							<span class="row-sub">{bar.sub}</span>
						</div>
						<div class="row-bar">
							<span class="bar-track">
								<span
									class="bar-fill {bar.tone}"
									class:complete={isBarComplete(r, bar.dur)}
									style="width: {getAnimatedWidth(r, bar.dur)}%;"
								></span>
							</span>
							<span class="row-time" class:complete={isBarComplete(r, bar.dur)}>
								{formatDuration(getAnimatedTime(r, bar.dur))}
							</span>
						</div>
					</article>
				{/each}
			</div>
		</section>

		<!-- PARSER-ONLY -->
		{#if r.parse}
			{@const p = r.parse}
			<section class="spec parse-section">
				<header class="spec-head">
					<span class="kicker">§ 03 — Parser only</span>
					<h2><em>Phase 1</em> alone.</h2>
					<p class="lede">
						Parsing isolated from analysis and codegen. The Rust port hits
						<strong>{p.speedup.multiThreadVsJs.toFixed(1)}×</strong> over JavaScript
						multi-threaded (<strong>{p.speedup.singleThreadVsJs.toFixed(1)}×</strong>
						single-threaded).
					</p>
				</header>

				<div class="chart">
					{#each [
						{ name: 'JavaScript', sub: 'svelte/compiler · parse', dur: p.javascript.durationMs, tone: 'js' },
						{ name: 'Rust · single', sub: 'parser instance reused per file', dur: p.rustSingleThread.durationMs, tone: 'rs' },
						{ name: 'Rust · multi', sub: 'rayon fan-out', dur: p.rustMultiThread.durationMs, tone: 'rm' }
					] as bar (bar.name)}
						<article class="chart-row">
							<div class="row-meta">
								<strong>{bar.name}</strong>
								<span class="row-sub">{bar.sub}</span>
							</div>
							<div class="row-bar">
								<span class="bar-track">
									<span
										class="bar-fill {bar.tone}"
										class:complete={isBarComplete(p, bar.dur)}
										style="width: {getAnimatedWidth(p, bar.dur)}%;"
									></span>
								</span>
								<span class="row-time" class:complete={isBarComplete(p, bar.dur)}>
									{formatDuration(getAnimatedTime(p, bar.dur))}
								</span>
							</div>
						</article>
					{/each}
				</div>
			</section>
		{/if}

		<!-- SVELTE2TSX -->
		{#if r.svelte2tsx}
			{@const s = r.svelte2tsx}
			<section class="spec parse-section">
				<header class="spec-head">
					<span class="kicker">§ 04 — svelte2tsx</span>
					<h2><em>TSX</em> generation.</h2>
					<p class="lede">
						svelte2tsx converts <code>.svelte</code> files to TSX so TypeScript can type-check them.
						The Rust port hits
						<strong>{s.speedup.multiThreadVsJs.toFixed(1)}×</strong> over the upstream
						<code>svelte2tsx</code> package multi-threaded (<strong
							>{s.speedup.singleThreadVsJs.toFixed(1)}×</strong
						>
						single-threaded).
					</p>
				</header>

				<div class="chart">
					{#each [
						{ name: 'JavaScript', sub: 'language-tools · svelte2tsx', dur: s.javascript.durationMs, tone: 'js' },
						{ name: 'Rust · single', sub: 'no parallelism', dur: s.rustSingleThread.durationMs, tone: 'rs' },
						{ name: 'Rust · multi', sub: 'rayon fan-out', dur: s.rustMultiThread.durationMs, tone: 'rm' }
					] as bar (bar.name)}
						<article class="chart-row">
							<div class="row-meta">
								<strong>{bar.name}</strong>
								<span class="row-sub">{bar.sub}</span>
							</div>
							<div class="row-bar">
								<span class="bar-track">
									<span
										class="bar-fill {bar.tone}"
										class:complete={isBarComplete(s, bar.dur)}
										style="width: {getAnimatedWidth(s, bar.dur)}%;"
									></span>
								</span>
								<span class="row-time" class:complete={isBarComplete(s, bar.dur)}>
									{formatDuration(getAnimatedTime(s, bar.dur))}
								</span>
							</div>
						</article>
					{/each}
				</div>
			</section>
		{/if}

		<!-- THROUGHPUT -->
		<section class="metrics">
			<header class="spec-head">
				<span class="kicker">§ 05 — Throughput</span>
				<h2><em>Higher</em> is better.</h2>
				<p class="lede">
					Files compiled per second on the same corpus. Multi-threaded rsvelte fans out
					compilation across rayon's global thread pool.
				</p>
			</header>

			<div class="metrics-grid">
				<article class="metric-card">
					<span class="metric-label">JavaScript</span>
					<span class="metric-num"
						>{formatThroughput(r.javascript.throughputFilesPerSec)}<span class="metric-unit"
							>/s</span
						></span
					>
					<span class="metric-tag js">baseline</span>
				</article>
				<article class="metric-card">
					<span class="metric-label">Rust · single</span>
					<span class="metric-num"
						>{formatThroughput(r.rustSingleThread.throughputFilesPerSec)}<span class="metric-unit"
							>/s</span
						></span
					>
					<span class="metric-tag rs"
						>{r.speedup.singleThreadVsJs.toFixed(1)}× faster</span
					>
				</article>
				<article class="metric-card accent">
					<span class="metric-label">Rust · multi</span>
					<span class="metric-num"
						>{formatThroughput(r.rustMultiThread.throughputFilesPerSec)}<span class="metric-unit"
							>/s</span
						></span
					>
					<span class="metric-tag rm"
						>{r.speedup.multiThreadVsJs.toFixed(1)}× faster</span
					>
				</article>
			</div>
		</section>

		<!-- HOW TO RUN -->
		<section class="howto">
			<header class="spec-head">
				<span class="kicker">§ 06 — Reproduce</span>
				<h2>Run it <em>yourself</em>.</h2>
			</header>

			<figure class="diff">
				<figcaption>
					<span class="diff-file">your-shell</span>
					<span class="diff-rule"></span>
					<span class="diff-tag">bash</span>
				</figcaption>
				<pre><code><span class="cmt"># 1. Build the Rust compiler in release mode</span>
<span class="line"><span class="sigil">$</span> cargo build <span class="flag">--release</span></span>

<span class="cmt"># 2. Run the corpus benchmark</span>
<span class="line"><span class="sigil">$</span> node scripts/run-benchmark.mjs <span class="op">&gt;</span> docs/static/benchmark-results.json</span>

<span class="cmt"># 3. View the report locally</span>
<span class="line"><span class="sigil">$</span> cd docs <span class="op">&amp;&amp;</span> pnpm dev</span></code></pre>
			</figure>
		</section>
	{/if}
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}

	.page {
		--bg: #f1e8d6;
		--surface: #e6dac1;
		--ink: #1a1612;
		--ink-soft: #7a7062;
		--ink-faint: #b8ab93;
		--accent: #ff3e00;
		--accent-deep: #c52f00;
		--js: #c79100;
		--rs: #7d4c1e;
		--rm: #ff3e00;
		--hairline: rgba(26, 22, 18, 0.16);
		--hairline-strong: rgba(26, 22, 18, 0.4);

		--display: 'Fraunces', 'Source Serif Pro', Georgia, serif;
		--body: 'Instrument Sans', system-ui, -apple-system, sans-serif;
		--mono: 'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace;

		background: var(--bg);
		color: var(--ink);
		font-family: var(--body);
		-webkit-font-smoothing: antialiased;
		min-height: 100vh;
		position: relative;
		overflow-x: hidden;
		font-feature-settings: 'ss01';
	}

	.grain {
		position: fixed;
		inset: 0;
		pointer-events: none;
		z-index: 80;
		opacity: 0.07;
		mix-blend-mode: multiply;
		background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.4' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
	}

	.spine {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 3rem;
		width: 1px;
		background: var(--hairline);
		z-index: 0;
	}

	.strip {
		position: sticky;
		top: 0;
		z-index: 60;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.1rem 2.5rem;
		background: var(--bg);
		border-bottom: 1px solid var(--hairline);
		font-family: var(--mono);
		font-size: 0.78rem;
		letter-spacing: 0.04em;
	}

	.strip-l {
		display: flex;
		align-items: baseline;
		gap: 0.9rem;
	}

	.strip .mark {
		font-family: var(--display);
		font-style: italic;
		font-weight: 500;
		font-size: 1.45rem;
		letter-spacing: -0.025em;
		font-variation-settings: 'opsz' 96, 'SOFT' 80, 'WONK' 1;
		color: var(--ink);
		text-decoration: none;
		line-height: 1;
	}

	.strip-r {
		display: flex;
		gap: 1.7rem;
		align-items: center;
	}

	.strip-r a {
		text-decoration: none;
		color: var(--ink);
		text-transform: uppercase;
		font-size: 0.72rem;
		letter-spacing: 0.16em;
		padding-bottom: 2px;
		border-bottom: 1px solid transparent;
		transition: border-color 0.25s ease, color 0.25s ease;
	}

	.strip-r a:hover,
	.strip-r a.active {
		border-bottom-color: var(--accent);
		color: var(--accent);
	}

	.strip-r .chev {
		display: inline-block;
		margin-left: 0.25em;
		font-family: var(--mono);
	}

	/* ============================================================
	   HERO
	   ============================================================ */
	.hero {
		position: relative;
		padding: clamp(3rem, 8vh, 7rem) clamp(1.5rem, 6vw, 6rem) clamp(4rem, 9vh, 8rem);
		isolation: isolate;
	}

	.margin {
		position: absolute;
		font-family: var(--mono);
		font-size: 0.73rem;
		letter-spacing: 0.06em;
		color: var(--ink-soft);
		line-height: 1.55;
		z-index: 3;
	}

	.margin-tl {
		top: clamp(2rem, 6vh, 5rem);
		left: clamp(1.5rem, 6vw, 6rem);
		display: flex;
		align-items: center;
		gap: 0.7rem;
	}

	.margin-tl .serif-italic {
		font-family: var(--display);
		font-style: italic;
		font-size: 1rem;
		color: var(--ink);
		font-variation-settings: 'opsz' 14, 'SOFT' 100, 'WONK' 1;
	}

	.margin-tr {
		top: clamp(2rem, 6vh, 5rem);
		right: clamp(1.5rem, 6vw, 6rem);
		text-align: right;
	}

	.margin-tr .strong {
		color: var(--ink);
		font-weight: 500;
	}

	.margin .rule {
		display: inline-block;
		width: 2.2rem;
		height: 1px;
		background: var(--ink);
	}

	.meta {
		color: var(--ink-soft);
	}

	.hero-figure {
		position: absolute;
		top: 14vh;
		right: -3vw;
		z-index: 0;
		font-family: var(--display);
		font-style: italic;
		font-variation-settings: 'opsz' 144, 'SOFT' 100, 'WONK' 1;
		color: var(--accent);
		opacity: 0.13;
		font-size: clamp(16rem, 42vw, 56rem);
		line-height: 0.8;
		pointer-events: none;
		user-select: none;
		letter-spacing: -0.05em;
		display: flex;
		align-items: baseline;
	}

	.hero-figure .num {
		display: inline-block;
		transform: rotate(-6deg);
		transform-origin: bottom left;
	}

	.hero-figure .x {
		display: inline-block;
		transform: rotate(2deg) translateY(-0.05em);
		font-size: 0.78em;
	}

	.hero-title {
		font-family: var(--display);
		font-weight: 300;
		line-height: 0.86;
		letter-spacing: -0.035em;
		font-size: clamp(3rem, 11vw, 13rem);
		margin: clamp(4rem, 10vh, 8rem) 0 0;
		position: relative;
		z-index: 2;
	}

	.hero-title .line {
		display: block;
	}

	.hero-title em {
		font-style: italic;
		font-weight: 400;
		font-variation-settings: 'opsz' 144, 'SOFT' 100, 'WONK' 1;
		color: var(--accent);
		padding-right: 0.04em;
	}

	.hero-stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
		gap: clamp(1rem, 3vw, 3rem);
		margin: clamp(3rem, 6vh, 5rem) 0 0;
		padding: clamp(1.5rem, 3vh, 2.5rem) 0;
		border-top: 1px solid var(--hairline-strong);
		border-bottom: 1px solid var(--hairline);
		position: relative;
		z-index: 2;
	}

	.hero-stats > div {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.hero-stats dt {
		font-family: var(--mono);
		font-size: 0.7rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--accent);
	}

	.hero-stats dd {
		margin: 0;
		display: flex;
		align-items: baseline;
		gap: 0.7rem;
		flex-wrap: wrap;
	}

	.hero-stats .big {
		font-family: var(--display);
		font-feature-settings: 'tnum' 1, 'lnum' 1;
		font-variation-settings: 'opsz' 144;
		font-size: clamp(2.2rem, 4.5vw, 3.8rem);
		letter-spacing: -0.03em;
		font-weight: 400;
		line-height: 1;
		color: var(--ink);
	}

	.hero-stats .big .x {
		font-family: var(--display);
		font-style: italic;
		font-variation-settings: 'opsz' 144, 'SOFT' 100, 'WONK' 1;
		color: var(--accent);
		font-size: 0.7em;
		margin-left: 0.05em;
	}

	.hero-stats .dim {
		font-family: var(--mono);
		font-size: 0.78rem;
		color: var(--ink-soft);
		letter-spacing: 0.04em;
	}

	/* ============================================================
	   SECTION SHELL
	   ============================================================ */
	.spec,
	.metrics,
	.howto {
		padding: clamp(4rem, 9vh, 8rem) clamp(1.5rem, 6vw, 6rem);
		border-top: 1px solid var(--hairline);
		position: relative;
		z-index: 1;
	}

	.metrics {
		background: var(--surface);
	}

	.spec-head {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		margin-bottom: clamp(2.5rem, 5vh, 4rem);
	}

	.spec-head-line {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: 2rem;
		flex-wrap: wrap;
	}

	.kicker {
		font-family: var(--mono);
		font-size: 0.74rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--accent);
		display: inline-block;
	}

	.spec-head h2,
	.empty-title {
		font-family: var(--display);
		font-weight: 300;
		font-size: clamp(2.4rem, 6.5vw, 6rem);
		line-height: 0.92;
		letter-spacing: -0.028em;
		margin: 0.5rem 0 0;
	}

	.spec-head em,
	.empty-title em {
		font-style: italic;
		color: var(--accent);
		font-variation-settings: 'opsz' 144, 'SOFT' 100, 'WONK' 1;
		font-weight: 400;
		padding-right: 0.03em;
	}

	.lede {
		font-size: clamp(1.05rem, 1.3vw, 1.25rem);
		max-width: 56ch;
		color: var(--ink-soft);
		line-height: 1.55;
		margin: 0;
	}

	.chip {
		font-family: var(--mono);
		font-size: 0.84em;
		background: var(--surface);
		color: var(--ink);
		padding: 0.12em 0.5em;
		border-radius: 3px;
		white-space: nowrap;
		border: 1px solid var(--hairline);
	}

	/* ============================================================
	   REPLAY BUTTON
	   ============================================================ */
	.replay {
		font-family: var(--mono);
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.16em;
		padding: 0.65rem 1.1rem;
		background: transparent;
		border: 1px solid var(--ink);
		color: var(--ink);
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		gap: 0.55em;
		transition: background 0.25s ease, color 0.25s ease;
	}

	.replay:hover:not(:disabled) {
		background: var(--ink);
		color: var(--bg);
	}

	.replay:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.replay-chev {
		font-family: var(--mono);
		display: inline-block;
		transition: transform 0.4s ease;
	}

	.replay:hover:not(:disabled) .replay-chev {
		transform: rotate(180deg);
	}

	/* ============================================================
	   CHART
	   ============================================================ */
	.chart {
		display: flex;
		flex-direction: column;
		border-top: 1px solid var(--hairline-strong);
	}

	.chart-row {
		display: grid;
		grid-template-columns: minmax(11rem, 18rem) 1fr;
		gap: clamp(1.5rem, 3vw, 3rem);
		align-items: center;
		padding: clamp(1.5rem, 3vh, 2.25rem) 0;
		border-bottom: 1px solid var(--hairline);
	}

	.row-meta strong {
		display: block;
		font-weight: 500;
		font-size: clamp(1rem, 1.15vw, 1.2rem);
		letter-spacing: -0.01em;
		color: var(--ink);
	}

	.row-sub {
		font-family: var(--mono);
		color: var(--ink-soft);
		font-size: 0.72rem;
		letter-spacing: 0.04em;
		display: block;
		margin-top: 0.35rem;
		text-transform: lowercase;
	}

	.row-bar {
		display: flex;
		align-items: center;
		gap: 1.25rem;
	}

	.bar-track {
		flex: 1;
		height: 14px;
		background: var(--surface);
		position: relative;
		overflow: hidden;
		display: block;
		border: 1px solid var(--hairline);
	}

	.bar-fill {
		position: absolute;
		inset: 0;
		width: 0;
		transition: opacity 0.3s ease;
		opacity: 0.85;
	}

	.bar-fill.complete {
		opacity: 1;
	}

	.bar-fill.js { background: var(--js); }
	.bar-fill.rs { background: var(--rs); }
	.bar-fill.rm { background: var(--rm); }

	.row-time {
		font-family: var(--display);
		font-feature-settings: 'tnum' 1, 'lnum' 1;
		font-variation-settings: 'opsz' 96;
		font-weight: 400;
		font-size: clamp(1.4rem, 2.3vw, 2rem);
		letter-spacing: -0.02em;
		line-height: 1;
		color: var(--ink-soft);
		min-width: 7rem;
		text-align: right;
		transition: color 0.3s ease;
	}

	.row-time.complete {
		color: var(--ink);
	}

	/* ============================================================
	   METRICS GRID
	   ============================================================ */
	.metrics-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
		gap: clamp(1rem, 2vw, 1.5rem);
	}

	.metric-card {
		background: var(--bg);
		border: 1px solid var(--hairline-strong);
		padding: clamp(1.5rem, 3vw, 2.25rem);
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
		position: relative;
	}

	.metric-card.accent {
		background: var(--ink);
		color: var(--bg);
		border-color: var(--ink);
	}

	.metric-card.accent .metric-label {
		color: var(--bg);
		opacity: 0.6;
	}

	.metric-card.accent .metric-num {
		color: var(--bg);
	}

	.metric-card.accent .metric-num .metric-unit {
		color: var(--accent);
	}

	.metric-label {
		font-family: var(--mono);
		font-size: 0.72rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--ink-soft);
	}

	.metric-num {
		font-family: var(--display);
		font-feature-settings: 'tnum' 1, 'lnum' 1;
		font-variation-settings: 'opsz' 144;
		font-weight: 400;
		font-size: clamp(2.4rem, 4.5vw, 4rem);
		letter-spacing: -0.03em;
		line-height: 1;
		color: var(--ink);
		display: inline-flex;
		align-items: baseline;
	}

	.metric-unit {
		font-family: var(--display);
		font-style: italic;
		font-variation-settings: 'opsz' 144, 'SOFT' 100, 'WONK' 1;
		font-size: 0.5em;
		color: var(--ink-soft);
		margin-left: 0.1em;
	}

	.metric-tag {
		font-family: var(--mono);
		font-size: 0.72rem;
		letter-spacing: 0.06em;
		text-transform: lowercase;
		color: var(--ink-soft);
		padding-top: 0.5rem;
		border-top: 1px solid var(--hairline);
	}

	.metric-card.accent .metric-tag {
		color: var(--accent);
		border-top-color: rgba(241, 232, 214, 0.16);
	}

	/* ============================================================
	   HOWTO DIFF / SHELL
	   ============================================================ */
	.diff {
		background: #15110d;
		color: #f0e6d2;
		font-family: var(--mono);
		font-size: clamp(0.85rem, 1.05vw, 1rem);
		margin: 0;
		max-width: 80ch;
		box-shadow: 0 30px 60px -25px rgba(26, 22, 18, 0.4);
		border: 1px solid var(--hairline-strong);
	}

	.diff figcaption {
		display: flex;
		align-items: center;
		padding: 0.85rem 1.5rem;
		border-bottom: 1px solid rgba(244, 236, 221, 0.12);
		font-size: 0.7rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: rgba(244, 236, 221, 0.55);
		gap: 1rem;
	}

	.diff .diff-file {
		color: rgba(244, 236, 221, 0.85);
	}

	.diff .diff-rule {
		flex: 1;
		height: 1px;
		background: rgba(244, 236, 221, 0.18);
	}

	.diff .diff-tag {
		color: var(--accent);
	}

	.diff pre {
		margin: 0;
		padding: 1.75rem 1.5rem;
		white-space: pre-wrap;
		line-height: 1.65;
		overflow-x: auto;
	}

	.diff code {
		font-family: inherit;
		font-size: inherit;
	}

	.diff .cmt {
		display: block;
		color: rgba(244, 236, 221, 0.45);
	}

	.diff .line {
		display: block;
	}

	.diff .sigil {
		color: var(--accent);
		margin-right: 0.6em;
	}

	.diff .flag {
		color: #f9b56a;
	}

	.diff .op {
		color: rgba(244, 236, 221, 0.55);
	}

	/* ============================================================
	   EMPTY STATE
	   ============================================================ */
	.empty {
		padding: clamp(5rem, 12vh, 10rem) clamp(1.5rem, 6vw, 6rem);
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		max-width: 60rem;
	}

	.empty-sub {
		font-size: clamp(1.05rem, 1.3vw, 1.25rem);
		color: var(--ink-soft);
		line-height: 1.55;
		max-width: 56ch;
		margin: 0;
	}

	.empty-code {
		font-family: var(--mono);
		background: #15110d;
		color: #f0e6d2;
		padding: 1.25rem 1.5rem;
		font-size: 0.85rem;
		line-height: 1.65;
		margin: 1rem 0 0;
		max-width: 70ch;
		border: 1px solid var(--hairline-strong);
		overflow-x: auto;
		white-space: pre;
	}

	@media (max-width: 880px) {
		.spine,
		.margin-tr,
		.margin-tl {
			display: none;
		}
		.strip {
			padding: 0.85rem 1.25rem;
		}
		.strip-r {
			gap: 1rem;
		}
		.strip-r a {
			font-size: 0.65rem;
			letter-spacing: 0.1em;
		}
		.hero {
			padding-top: 3rem;
		}
		.hero-figure {
			top: 6vh;
			right: -8vw;
			opacity: 0.08;
		}
		.chart-row {
			grid-template-columns: 1fr;
			gap: 1rem;
		}
		.row-bar {
			flex-direction: row;
		}
		.row-time {
			min-width: 5rem;
			font-size: 1.4rem;
		}
	}
</style>
