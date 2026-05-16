<script lang="ts">
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import type { BenchmarkResults } from '$lib/types/benchmark';

	let bench = $state<BenchmarkResults | null>(null);

	onMount(async () => {
		try {
			const res = await fetch(`${base}/benchmark-results.json`);
			if (res.ok) bench = await res.json();
		} catch {
			bench = null;
		}
	});

	const specs = [
		{ n: 3341, label: 'tests passing', sub: 'in-scope, 100%' },
		{ n: 1202, label: 'runtime · legacy', sub: 'svelte 4 parity' },
		{ n: 865, label: 'runtime · runes', sub: '$state · $derived · $effect' },
		{ n: 324, label: 'validator + a11y', sub: 'warning / error detection' },
		{ n: 245, label: 'svelte2tsx', sub: 'wave 1 of ecosystem port' },
		{ n: 179, label: 'css', sub: ':global · scoping · keyframes' }
	];

	const why = [
		{
			h: 'Parallel by default.',
			p: 'Compilation fans out across rayon. The parser is thread-safe; phase outputs pass directly through without re-parsing.'
		},
		{
			h: 'Compact memory.',
			p: 'u32 source positions, compact_str on hot paths, AST nodes shaped to keep cache lines warm.'
		},
		{
			h: 'OXC-ready.',
			p: 'Conventions mirror oxc_ast so the compiler drops cleanly into the wider OXC toolchain.'
		}
	];
</script>

<svelte:head>
	<title>rsvelte · a Rust port of the Svelte 5 compiler</title>
	<meta
		name="description"
		content="A drop-in replacement for svelte/compiler, rewritten in Rust. Same surface, same output, multi-threaded by default."
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
			<a href="{base}/benchmark">Benchmark</a>
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

	<header class="hero">
		<div class="hero-text">
			<p class="eyebrow">The Svelte 5 compiler · rewritten in Rust</p>

			<h1>
				A <span class="ink-svelte">Rust</span> port of <span class="ink-svelte">Svelte</span>.
			</h1>

			<p class="lede">
				A drop-in replacement for <code>svelte/compiler</code>. Same surface,
				identical output, parallel by default.
			</p>

			<div class="cta">
				<a href="{base}/playground" class="btn btn-primary">
					Open playground
					<span aria-hidden="true">→</span>
				</a>
				<a href="{base}/benchmark" class="btn btn-ghost">
					See benchmark
					<span aria-hidden="true">→</span>
				</a>
			</div>
		</div>

		<aside class="hero-card" aria-label="Install snippet">
			<header class="card-header">
				<span class="dot dot-r"></span>
				<span class="dot dot-y"></span>
				<span class="dot dot-g"></span>
				<span class="card-path">~/your-app · install</span>
			</header>
			<pre class="card-body"><code><span class="c-cmt"># swap one import — that's it</span>
<span class="c-prompt">$</span> pnpm add <span class="c-pkg">@rsvelte/compiler</span>

<span class="c-cmt"># or pin from source</span>
<span class="c-prompt">$</span> cargo add <span class="c-pkg">rsvelte</span>
</code></pre>
			<footer class="card-foot">
				<span class="kbd">rust 1.84</span>
				<span class="kbd">node 22+</span>
				<span class="kbd">svelte 5.51.3</span>
			</footer>
		</aside>
	</header>

	<!-- Compact benchmark strip — the headline numbers right here, not buried -->
	<section class="bench-strip" aria-label="Headline benchmark">
		<div class="bench-strip-inner">
			<div class="bench-eyebrow">
				<span class="rule-h"></span>
				<span class="bench-label">Compilation speed · against svelte/compiler</span>
			</div>

			<div class="bench-cells">
				<div class="bench-cell big">
					<span class="bench-n">
						{bench ? bench.speedup.multiThreadVsJs.toFixed(1) : '—'}<span class="x">×</span>
					</span>
					<span class="bench-k">multi-threaded</span>
					<span class="bench-s">rayon fan-out · full pipeline</span>
				</div>
				<div class="bench-cell">
					<span class="bench-n">
						{bench ? bench.parse.speedup.multiThreadVsJs.toFixed(0) : '—'}<span class="x">×</span>
					</span>
					<span class="bench-k">parser only</span>
					<span class="bench-s">phase 1, isolated</span>
				</div>
				<div class="bench-cell">
					<span class="bench-n">
						{bench
							? `${(bench.rustMultiThread.throughputFilesPerSec / 1000).toFixed(1)}k`
							: '—'}<span class="x">/s</span>
					</span>
					<span class="bench-k">throughput</span>
					<span class="bench-s">files compiled per second</span>
				</div>
				<a class="bench-link" href="{base}/benchmark">
					Full benchmark
					<span aria-hidden="true">→</span>
				</a>
			</div>
		</div>
	</section>

	<!-- Drop-in diff -->
	<section class="dropin">
		<div class="section-head">
			<span class="num">02</span>
			<h2>One <em>import</em>. No flags.</h2>
			<p class="lede">
				No bundler plugin to wire, no compiler flag to flip. Same
				<code>compile()</code>, <code>compileModule()</code>,
				<code>parse()</code>, <code>preprocess()</code>.
			</p>
		</div>

		<figure class="diff">
			<figcaption>
				<span class="diff-file">build.config.js</span>
				<span class="diff-tag">diff</span>
			</figcaption>
			<pre><code><span class="d-line d-minus"><span class="d-sig">-</span> import * as svelte from <span class="d-str">'svelte/compiler'</span>;</span>
<span class="d-line d-plus"><span class="d-sig">+</span> import * as svelte from <span class="d-str">'@rsvelte/compiler'</span>;</span></code></pre>
		</figure>
	</section>

	<!-- Compatibility — compact list -->
	<section class="spec">
		<div class="section-head">
			<span class="num">03</span>
			<h2>Every test, passing.</h2>
			<p class="lede">
				Each row mirrors a category in the official <code>sveltejs/svelte</code>
				suite, run against commit <code>04c0368a</code>. Full breakdown on the
				<a class="link" href="{base}/progress">compatibility page</a>.
			</p>
		</div>

		<div class="spec-list">
			{#each specs as s, i (s.label)}
				<div class="spec-row" style="--i: {i};">
					<div class="spec-n">{s.n.toLocaleString('en-US')}</div>
					<div class="spec-body">
						<div class="spec-k">{s.label}</div>
						<div class="spec-s">{s.sub}</div>
					</div>
					<div class="spec-bar">
						<span class="bar-track"><span class="bar-fill"></span></span>
						<span class="spec-pct">100<span class="dim">%</span></span>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- Why Rust -->
	<section class="why">
		<div class="section-head">
			<span class="num">04</span>
			<h2>Built for the next Svelte.</h2>
		</div>

		<div class="why-grid">
			{#each why as w (w.h)}
				<article class="why-card">
					<span class="why-tick" aria-hidden="true">
						<svg viewBox="0 0 16 16" width="16" height="16">
							<path
								d="M3 8.5 6.5 12 13 4.5"
								fill="none"
								stroke="currentColor"
								stroke-width="1.6"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					</span>
					<h3>{w.h}</h3>
					<p>{w.p}</p>
				</article>
			{/each}
		</div>
	</section>

	<footer class="foot">
		<div class="foot-inner">
			<div class="foot-mark">
				<span class="brand-icon" aria-hidden="true">
					<svg viewBox="0 0 24 24" width="18" height="18" fill="none">
						<path d="M19 8 13 18l-2-4 6-10 2 4Z" fill="#ff3e00" />
						<path d="M5 16 11 6l2 4-6 10-2-4Z" fill="#ce422b" />
					</svg>
				</span>
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
		-moz-osx-font-smoothing: grayscale;
	}

	:global(body) {
		margin: 0;
	}

	code,
	.kbd {
		font-family: var(--mono);
	}

	/* ============================================================
	   NAV — compact top bar, Svelte.dev style
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

	.nav-links a:hover {
		color: var(--svelte);
		border-bottom-color: var(--svelte);
	}

	.nav-links .gh {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
	}

	/* ============================================================
	   HERO — two columns: copy + install card
	   ============================================================ */
	.hero {
		display: grid;
		grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
		gap: clamp(2rem, 5vw, 4.5rem);
		align-items: center;
		padding: clamp(3rem, 8vh, 5.5rem) clamp(1rem, 3vw, 2.25rem) clamp(2.5rem, 6vh, 4rem);
		max-width: 1280px;
		margin: 0 auto;
	}

	.eyebrow {
		font-family: var(--mono);
		font-size: 0.78rem;
		letter-spacing: 0.06em;
		color: var(--rust);
		margin: 0 0 1.4rem;
	}

	.hero h1 {
		font-family: var(--sans);
		font-weight: 700;
		font-size: clamp(2.5rem, 5.6vw, 4.2rem);
		line-height: 1.02;
		letter-spacing: -0.025em;
		margin: 0;
		color: var(--ink);
	}

	.ink-svelte {
		color: var(--svelte);
	}

	.lede {
		font-size: clamp(1rem, 1.1vw, 1.15rem);
		max-width: 44ch;
		color: var(--ink-soft);
		margin: 1.4rem 0 0;
	}

	.lede code {
		background: var(--surface);
		color: var(--ink);
		padding: 0.08em 0.4em;
		border-radius: 4px;
		font-size: 0.9em;
		border: 1px solid var(--rule);
	}

	.cta {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
		margin-top: 2rem;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.7rem 1.1rem;
		font-family: var(--sans);
		font-weight: 700;
		font-size: 0.95rem;
		border-radius: 6px;
		text-decoration: none;
		border: 1px solid transparent;
		transition:
			background 0.18s,
			color 0.18s,
			border-color 0.18s,
			transform 0.18s;
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
		background: var(--accent-deep);
	}

	.btn-ghost {
		background: transparent;
		color: var(--ink);
		border-color: var(--rule-strong);
	}

	.btn-ghost:hover {
		border-color: var(--ink);
	}

	/* ============================================================
	   HERO CARD — terminal-style install snippet (Cargo cue)
	   ============================================================ */
	.hero-card {
		background: var(--ink);
		color: #ede8d8;
		border-radius: 10px;
		font-family: var(--mono);
		box-shadow: 0 14px 32px -22px rgba(21, 20, 15, 0.6);
		border: 1px solid #2a2620;
		overflow: hidden;
	}

	.card-header {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.7rem 0.95rem;
		border-bottom: 1px solid rgba(237, 232, 216, 0.08);
		font-size: 0.74rem;
	}

	.dot {
		width: 11px;
		height: 11px;
		border-radius: 50%;
		display: inline-block;
	}

	.dot-r {
		background: #ff5f57;
	}
	.dot-y {
		background: #febc2e;
	}
	.dot-g {
		background: #28c840;
	}

	.card-path {
		margin-left: 0.6rem;
		color: rgba(237, 232, 216, 0.5);
		letter-spacing: 0.04em;
		font-size: 0.72rem;
	}

	.card-body {
		margin: 0;
		padding: 1.1rem 1.25rem;
		font-size: 0.85rem;
		line-height: 1.7;
	}

	.card-body code {
		font-family: inherit;
	}

	.c-cmt {
		color: rgba(237, 232, 216, 0.4);
	}

	.c-prompt {
		color: var(--svelte);
		margin-right: 0.5em;
	}

	.c-pkg {
		color: #ffb380;
	}

	.card-foot {
		display: flex;
		gap: 0.4rem;
		padding: 0.55rem 0.95rem 0.75rem;
		border-top: 1px solid rgba(237, 232, 216, 0.08);
		flex-wrap: wrap;
	}

	.kbd {
		font-size: 0.65rem;
		letter-spacing: 0.08em;
		color: rgba(237, 232, 216, 0.55);
		padding: 0.18rem 0.5rem;
		border: 1px solid rgba(237, 232, 216, 0.14);
		border-radius: 4px;
		text-transform: lowercase;
	}

	/* ============================================================
	   BENCH STRIP — headline benchmark numbers, above-the-fold
	   ============================================================ */
	.bench-strip {
		background: var(--surface);
		border-block: 1px solid var(--rule);
	}

	.bench-strip-inner {
		max-width: 1280px;
		margin: 0 auto;
		padding: clamp(1.5rem, 3.5vh, 2.5rem) clamp(1rem, 3vw, 2.25rem);
	}

	.bench-eyebrow {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
	}

	.rule-h {
		display: inline-block;
		width: 28px;
		height: 1px;
		background: var(--rust);
	}

	.bench-label {
		font-family: var(--mono);
		font-size: 0.74rem;
		letter-spacing: 0.08em;
		color: var(--rust);
	}

	.bench-cells {
		display: grid;
		grid-template-columns: 1.4fr 1fr 1fr auto;
		gap: clamp(1rem, 3vw, 2.5rem);
		align-items: end;
	}

	.bench-cell {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		border-left: 1px solid var(--rule-strong);
		padding-left: clamp(1rem, 2vw, 1.5rem);
	}

	.bench-cell:first-child {
		border-left: none;
		padding-left: 0;
	}

	.bench-n {
		font-family: var(--sans);
		font-weight: 700;
		font-size: clamp(2.4rem, 4.8vw, 3.8rem);
		line-height: 1;
		letter-spacing: -0.035em;
		color: var(--ink);
		font-variant-numeric: tabular-nums;
		display: inline-flex;
		align-items: baseline;
	}

	.bench-cell.big .bench-n {
		color: var(--svelte);
	}

	.bench-n .x {
		font-family: var(--mono);
		font-weight: 500;
		font-size: 0.42em;
		letter-spacing: 0.02em;
		margin-left: 0.15em;
		color: var(--ink-faint);
	}

	.bench-cell.big .bench-n .x {
		color: var(--svelte);
		opacity: 0.7;
	}

	.bench-k {
		font-weight: 700;
		font-size: 0.9rem;
		color: var(--ink);
	}

	.bench-s {
		font-family: var(--mono);
		font-size: 0.72rem;
		letter-spacing: 0.03em;
		color: var(--ink-soft);
	}

	.bench-link {
		font-family: var(--mono);
		font-size: 0.78rem;
		text-decoration: none;
		color: var(--ink);
		padding: 0.55rem 0.9rem;
		border: 1px solid var(--rule-strong);
		border-radius: 6px;
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		transition:
			background 0.18s,
			border-color 0.18s,
			color 0.18s;
		white-space: nowrap;
		align-self: end;
	}

	.bench-link:hover {
		background: var(--ink);
		color: var(--bg);
		border-color: var(--ink);
	}

	/* ============================================================
	   SECTION SHELL
	   ============================================================ */
	.dropin,
	.spec,
	.why {
		max-width: 1280px;
		margin: 0 auto;
		padding: clamp(3.5rem, 7vh, 5.5rem) clamp(1rem, 3vw, 2.25rem);
	}

	.section-head {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.4rem 1.25rem;
		margin-bottom: clamp(2rem, 4vh, 3rem);
		align-items: baseline;
	}

	.section-head .num {
		font-family: var(--mono);
		font-size: 0.72rem;
		letter-spacing: 0.18em;
		color: var(--rust);
		grid-row: 1;
		grid-column: 1;
	}

	.section-head h2 {
		font-family: var(--sans);
		font-weight: 700;
		font-size: clamp(1.6rem, 2.8vw, 2.4rem);
		letter-spacing: -0.022em;
		margin: 0;
		color: var(--ink);
		line-height: 1.1;
		grid-row: 1;
		grid-column: 2;
	}

	.section-head h2 em {
		font-style: italic;
		color: var(--svelte);
	}

	.section-head .lede {
		grid-row: 2;
		grid-column: 2;
		margin-top: 0.6rem;
	}

	.link {
		color: var(--svelte);
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 3px;
	}

	.link:hover {
		color: var(--accent-deep);
	}

	/* ============================================================
	   DROP-IN diff
	   ============================================================ */
	.diff {
		margin: 0;
		max-width: 720px;
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
	}

	.diff .diff-tag {
		color: var(--svelte);
		text-transform: uppercase;
	}

	.diff pre {
		margin: 0;
		padding: 1.1rem 1.25rem;
		font-size: 0.9rem;
		line-height: 1.65;
	}

	.diff code {
		font-family: inherit;
	}

	.d-line {
		display: block;
		padding: 0.1rem 0;
	}

	.d-sig {
		display: inline-block;
		width: 1.2em;
		opacity: 0.75;
	}

	.d-minus {
		color: #f8a39a;
		background: rgba(248, 163, 154, 0.05);
	}

	.d-plus {
		color: #b6e6ad;
		background: rgba(182, 230, 173, 0.06);
	}

	.d-str {
		color: #ffb380;
	}

	/* ============================================================
	   SPEC LIST — compact compatibility rows
	   ============================================================ */
	.spec-list {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 28rem), 1fr));
		gap: 0;
		border-top: 1px solid var(--rule);
	}

	.spec-row {
		display: grid;
		grid-template-columns: minmax(4.5rem, 5.5rem) 1fr minmax(8rem, 11rem);
		gap: 1rem;
		align-items: center;
		padding: 1.05rem 1.1rem;
		border-bottom: 1px solid var(--rule);
		opacity: 0;
		transform: translateY(8px);
		animation: rowin 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
		animation-delay: calc(0.06s * var(--i, 0) + 0.05s);
	}

	@keyframes rowin {
		to {
			opacity: 1;
			transform: none;
		}
	}

	.spec-n {
		font-family: var(--sans);
		font-weight: 700;
		font-size: 1.5rem;
		font-variant-numeric: tabular-nums;
		letter-spacing: -0.02em;
		color: var(--ink);
	}

	.spec-k {
		font-weight: 700;
		font-size: 0.95rem;
		color: var(--ink);
	}

	.spec-s {
		font-family: var(--mono);
		font-size: 0.72rem;
		color: var(--ink-soft);
		margin-top: 0.15rem;
	}

	.spec-bar {
		display: flex;
		align-items: center;
		gap: 0.7rem;
	}

	.bar-track {
		flex: 1;
		height: 4px;
		background: var(--surface-2);
		border-radius: 999px;
		overflow: hidden;
		display: block;
	}

	.bar-fill {
		display: block;
		height: 100%;
		width: 0;
		background: var(--svelte);
		animation: fill 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
		animation-delay: calc(0.06s * var(--i, 0) + 0.25s);
	}

	@keyframes fill {
		to {
			width: 100%;
		}
	}

	.spec-pct {
		font-family: var(--mono);
		font-size: 0.78rem;
		color: var(--ink);
		font-variant-numeric: tabular-nums;
	}

	.spec-pct .dim {
		color: var(--ink-faint);
	}

	/* ============================================================
	   WHY GRID — three short cards
	   ============================================================ */
	.why-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
		gap: 1rem;
	}

	.why-card {
		background: var(--surface);
		border: 1px solid var(--rule);
		border-radius: 10px;
		padding: 1.4rem 1.5rem 1.6rem;
		position: relative;
	}

	.why-tick {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 26px;
		height: 26px;
		border-radius: 50%;
		background: var(--svelte);
		color: #fff;
		margin-bottom: 0.9rem;
	}

	.why-card h3 {
		font-family: var(--sans);
		font-weight: 700;
		font-size: 1.1rem;
		letter-spacing: -0.015em;
		color: var(--ink);
		margin: 0 0 0.4rem;
	}

	.why-card p {
		font-size: 0.95rem;
		color: var(--ink-soft);
		margin: 0;
	}

	/* ============================================================
	   FOOTER
	   ============================================================ */
	.foot {
		border-top: 1px solid var(--rule);
		background: var(--surface);
		margin-top: 2rem;
	}

	.foot-inner {
		max-width: 1280px;
		margin: 0 auto;
		padding: 1.5rem clamp(1rem, 3vw, 2.25rem);
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
		gap: 0.55rem;
		font-family: var(--mono);
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

	/* ============================================================
	   RESPONSIVE
	   ============================================================ */
	@media (max-width: 960px) {
		.hero {
			grid-template-columns: 1fr;
		}
		.hero-card {
			max-width: 540px;
		}
		.bench-cells {
			grid-template-columns: 1fr 1fr;
			gap: 1.4rem;
		}
		.bench-cell {
			border-left: none;
			padding-left: 0;
		}
		.bench-link {
			grid-column: 1 / -1;
			justify-self: start;
		}
		.spec-row {
			grid-template-columns: auto 1fr;
		}
		.spec-bar {
			grid-column: 1 / -1;
		}
	}

	@media (max-width: 640px) {
		.brand-tag {
			display: none;
		}
		.nav-links {
			gap: 0.85rem;
			font-size: 0.82rem;
		}
		.bench-cells {
			grid-template-columns: 1fr;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.spec-row,
		.bar-fill,
		.btn span {
			animation: none !important;
			transition: none !important;
			opacity: 1 !important;
			transform: none !important;
		}
		.bar-fill {
			width: 100%;
		}
	}
</style>
