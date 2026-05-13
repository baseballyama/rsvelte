<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';

	let mounted = $state(false);
	let scrollY = $state(0);

	onMount(() => {
		// Defer the entrance animation to next frame so the staggered
		// transitions actually run instead of jumping straight to final.
		requestAnimationFrame(() => {
			mounted = true;
		});
	});

	// Reading data, distilled. Mirrors the totals reported in CLAUDE.md /
	// the live compatibility report at /progress.
	const specRows = [
		{ num: 3341, label: 'Compatibility report total', sub: 'every in-scope category, 100%' },
		{ num: 1202, label: 'Runtime — legacy', sub: 'svelte 4 lifecycle parity' },
		{ num: 865, label: 'Runtime — runes', sub: '$state · $derived · $effect' },
		{ num: 324, label: 'Validator + A11y', sub: 'warning / error detection' },
		{ num: 245, label: 'svelte2tsx', sub: 'wave 1 of the ecosystem port' },
		{ num: 179, label: 'CSS', sub: 'scoping · :global · keyframes' }
	];

	const reasons = [
		{
			num: '01',
			title: 'Parallel by default.',
			body: `Compilation fans out across rayon's global pool. The parser is thread-safe;
				phase outputs pass directly to the next pass, with no re-parsing between them.`
		},
		{
			num: '02',
			title: 'Compact memory layout.',
			body: `u32 source positions, compact_str on the hot paths, AST nodes shaped to
				keep cache lines warm. The parser is intentionally a smaller blast radius than acorn.`
		},
		{
			num: '03',
			title: 'OXC-ready.',
			body: `Conventions mirror oxc_ast so the parser drops cleanly into the wider
				oxc toolchain. The endgame is one Rust core, many language tools.`
		}
	];
</script>

<svelte:window bind:scrollY />

<svelte:head>
	<title>rsvelte — Svelte, compiled in Rust.</title>
	<meta
		name="description"
		content="A Rust port of the Svelte 5 compiler. Drop-in replacement for svelte/compiler with the parser, analyser and code generator all written in Rust."
	/>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,200..900,0..100,0..1;1,9..144,200..900,0..100,0..1&family=Instrument+Sans:ital,wght@0,400..700;1,400..700&family=JetBrains+Mono:wght@400..700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="page" class:mounted>
	<!-- Paper grain. Inline SVG turbulence at very low opacity. -->
	<div class="grain" aria-hidden="true"></div>

	<!-- Cross-page rule running down the left margin. -->
	<div class="spine" aria-hidden="true"></div>

	<!-- ================================================================
	     TOP STRIP — masthead-style with a version badge on the left
	     and a row of plain links on the right.
	     ================================================================ -->
	<nav class="strip">
		<div class="strip-l">
			<a href="{base}/" class="mark">rsvelte</a>
		</div>
		<div class="strip-r">
			<a href="{base}/playground">Playground</a>
			<a href="{base}/progress">Compat</a>
			<a href="{base}/benchmark">Speed</a>
			<a
				href="https://github.com/baseballyama/rsvelte"
				target="_blank"
				rel="noopener"
				class="ext">GitHub <span class="chev">↗</span></a
			>
		</div>
	</nav>

	<!-- ================================================================
	     HERO — three giant lines stacked, with a colossal italic "100×"
	     sitting behind everything at low opacity. Margin annotations
	     in mono sit in the upper corners for that technical-document
	     feel.
	     ================================================================ -->
	<header class="hero">
		<aside class="margin margin-tl" aria-hidden="true">
			<span class="serif-italic">№ 001</span>
			<span class="rule"></span>
			<span class="meta">The compiler issue</span>
		</aside>

		<aside class="margin margin-tr" aria-hidden="true">
			<span class="meta">Edited from</span>
			<br />
			<span class="strong mono">sveltejs/svelte@5.51.3</span>
			<br />
			<span class="meta">Last verified</span>
			<br />
			<span class="strong mono">2026-05-13</span>
		</aside>

		<div class="hero-number" aria-hidden="true" style="transform: translateY({scrollY * 0.18}px);">
			<span class="num">100</span><span class="x">×</span>
		</div>

		<h1 class="hero-title">
			<span class="line line-1">Svelte,</span>
			<span class="line line-2"><em>compiled</em></span>
			<span class="line line-3">in Rust.</span>
		</h1>

		<p class="hero-sub">
			A drop-in replacement for <span class="chip">svelte/compiler</span> with the parser, analyser
			and code generator all rewritten in Rust. Same surface. One import away. Identical output to
			upstream Svelte 5.
		</p>

		<div class="hero-cta">
			<a href="{base}/playground" class="cta cta-primary">
				<span>Open the playground</span>
				<span class="chev">→</span>
			</a>
			<a href="{base}/progress" class="cta cta-ghost">
				<span>Read the compatibility report</span>
				<span class="chev">↗</span>
			</a>
		</div>

		<aside class="margin margin-bl" aria-hidden="true">
			<span class="rule rule-down"></span>
			<span class="meta">scroll for the specs</span>
		</aside>
	</header>

	<!-- ================================================================
	     SPEC SHEET — table-of-numbers section. Each row reads like a
	     line in a service manual: huge tabular number, label, and a
	     filled bar across to the right.
	     ================================================================ -->
	<section class="spec">
		<header class="spec-head">
			<span class="kicker">§ 02 — Compatibility</span>
			<h2><em>Every</em> test, passing.</h2>
			<p class="lede">
				Each row mirrors a category in the official <span class="chip">sveltejs/svelte</span>
				test suite, run live against commit
				<span class="chip">04c0368a</span>. The full breakdown — including the 76
				out-of-scope <span class="chip">migrate</span> fixtures — lives on the
				<a href="{base}/progress" class="inline-link">progress page</a>.
			</p>
		</header>

		<div class="spec-grid">
			{#each specRows as row, i (row.label)}
				<article class="spec-row" style="--i: {i};">
					<div class="row-num">
						{row.num.toLocaleString('en-US')}
					</div>
					<div class="row-label">
						<strong>{row.label}</strong>
						<span class="row-sub">{row.sub}</span>
					</div>
					<div class="row-bar">
						<span class="bar-track"><span class="bar-fill"></span></span>
						<span class="bar-pct">100<span class="dim">%</span></span>
					</div>
				</article>
			{/each}
		</div>
	</section>

	<!-- ================================================================
	     DROP-IN — one-line diff on a dark slab, with a marginal
	     annotation declaring that this is the whole change.
	     ================================================================ -->
	<section class="dropin">
		<header class="dropin-head">
			<span class="kicker">§ 03 — Drop-in</span>
			<h2>One <em>import.</em><br />No flags.</h2>
			<aside class="dropin-aside" aria-hidden="true">
				<span class="serif-italic">— that's the whole change.</span>
			</aside>
		</header>

		<figure class="diff">
			<figcaption>
				<span class="diff-file">your-config.js</span>
				<span class="diff-rule"></span>
				<span class="diff-tag">diff</span>
			</figcaption>
			<pre><code><span class="line minus"><span class="sigil">-</span> import * as svelte from <span class="str">'svelte/compiler'</span>;</span>
<span class="line plus"><span class="sigil">+</span> import * as svelte from <span class="str">'@rsvelte/compiler'</span>;</span></code></pre>
		</figure>

		<p class="dropin-sub">
			Same <span class="chip">compile()</span>, same <span class="chip">compileModule()</span>,
			same <span class="chip">parse()</span> + <span class="chip">preprocess()</span>. No bundler
			plugin to wire, no compiler flag to flip.
		</p>
	</section>

	<!-- ================================================================
	     WHY — a numbered editorial list. Each point gets its own row
	     with an oversized italic numeral on the left.
	     ================================================================ -->
	<section class="why">
		<header class="why-head">
			<span class="kicker">§ 04 — Why Rust</span>
			<h2>Built for the <em>next</em> Svelte.</h2>
		</header>

		<ol class="why-list">
			{#each reasons as reason (reason.num)}
				<li class="why-item">
					<span class="why-num" aria-hidden="true">{reason.num}</span>
					<div class="why-body">
						<h3>{reason.title}</h3>
						<p>{reason.body}</p>
					</div>
				</li>
			{/each}
		</ol>
	</section>

	<!-- ================================================================
	     CLOSING CALL — minimal, just the brand mark and two links,
	     set in italic against the orange field.
	     ================================================================ -->
	<section class="close">
		<p class="close-eyebrow">— Ready when you are.</p>
		<h2 class="close-headline"><em>Try</em> rsvelte.</h2>
		<div class="close-actions">
			<a href="{base}/playground" class="cta cta-inverse">
				<span>Open the playground</span>
				<span class="chev">→</span>
			</a>
			<a
				href="https://github.com/baseballyama/rsvelte"
				target="_blank"
				rel="noopener"
				class="cta cta-inverse-ghost"
			>
				<span>Read the source</span>
				<span class="chev">↗</span>
			</a>
		</div>
	</section>

</div>

<style>
	.page {
		/* ============================================================
		   PALETTE — warm cream paper, espresso ink, Svelte/Rust orange.
		   ============================================================ */
		--bg: #f1e8d6;
		--surface: #e6dac1;
		--ink: #1a1612;
		--ink-soft: #7a7062;
		--ink-faint: #b8ab93;
		--accent: #ff3e00;
		--accent-deep: #c52f00;
		--hairline: rgba(26, 22, 18, 0.16);
		--hairline-strong: rgba(26, 22, 18, 0.4);

		/* ============================================================
		   TYPE — Fraunces for display (variable; we lean on the SOFT
		   and WONK axes for the italics). Instrument Sans for body.
		   JetBrains Mono for the technical readouts.
		   ============================================================ */
		--display:
			'Fraunces', 'Source Serif Pro', 'Georgia', 'Times New Roman', Times, serif;
		--body: 'Instrument Sans', system-ui, -apple-system, sans-serif;
		--mono: 'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace;

		background: var(--bg);
		color: var(--ink);
		font-family: var(--body);
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		min-height: 100vh;
		position: relative;
		overflow-x: hidden;
		font-feature-settings: 'ss01';
	}

	/* Paper grain overlaid on everything. Small SVG turbulence; mix-blend
	   so it darkens slightly rather than washing the palette out. */
	.grain {
		position: fixed;
		inset: 0;
		pointer-events: none;
		z-index: 80;
		opacity: 0.07;
		mix-blend-mode: multiply;
		background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.4' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
	}

	/* A 1px gutter rule running the full height of the page, three
	   characters in from the left. Pure decoration, but it makes
	   every section feel like a printed page. */
	.spine {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 3rem;
		width: 1px;
		background: var(--hairline);
		z-index: 0;
	}

	/* ============================================================
	   TOP STRIP
	   ============================================================ */
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
		backdrop-filter: saturate(120%);
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

	.strip-r a:hover {
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
		padding: clamp(3rem, 9vh, 8rem) clamp(1.5rem, 6vw, 6rem) clamp(6rem, 14vh, 12rem);
		min-height: calc(100vh - 60px);
		display: flex;
		flex-direction: column;
		justify-content: center;
		z-index: 1;
		isolation: isolate;
	}

	.hero-title {
		font-family: var(--display);
		font-weight: 300;
		font-style: normal;
		line-height: 0.86;
		letter-spacing: -0.035em;
		font-size: clamp(3.5rem, 13.5vw, 16rem);
		margin: 0;
		position: relative;
		z-index: 2;
		max-width: 100%;
	}

	.hero-title .line {
		display: block;
		opacity: 0;
		transform: translateY(40px);
		transition:
			opacity 0.95s cubic-bezier(0.22, 1, 0.36, 1),
			transform 1.05s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.mounted .hero-title .line-1 {
		transition-delay: 0.05s;
		opacity: 1;
		transform: none;
	}
	.mounted .hero-title .line-2 {
		transition-delay: 0.22s;
		opacity: 1;
		transform: none;
	}
	.mounted .hero-title .line-3 {
		transition-delay: 0.4s;
		opacity: 1;
		transform: none;
	}

	.hero-title em {
		font-style: italic;
		font-weight: 400;
		font-variation-settings: 'opsz' 144, 'SOFT' 100, 'WONK' 1;
		color: var(--accent);
		display: inline-block;
		padding-right: 0.04em;
	}

	/* The colossal 100× sitting in the background. opsz 144 gives the
	   thick wedge serif; SOFT + WONK give it that slightly off-kilter,
	   hand-drawn quality. */
	.hero-number {
		position: absolute;
		top: 18vh;
		right: -3vw;
		z-index: 0;
		font-family: var(--display);
		font-style: italic;
		font-variation-settings: 'opsz' 144, 'SOFT' 100, 'WONK' 1;
		color: var(--accent);
		opacity: 0.13;
		font-size: clamp(18rem, 42vw, 56rem);
		line-height: 0.8;
		font-weight: 400;
		pointer-events: none;
		user-select: none;
		letter-spacing: -0.05em;
		display: flex;
		align-items: baseline;
		will-change: transform;
		transition: opacity 1.2s ease;
	}

	.mounted .hero-number {
		opacity: 0.15;
	}

	.hero-number .num {
		display: inline-block;
		transform: rotate(-7deg);
		transform-origin: bottom left;
	}

	.hero-number .x {
		display: inline-block;
		transform: rotate(2deg) translateY(-0.05em);
		font-size: 0.78em;
	}

	.hero-sub {
		font-family: var(--body);
		font-size: clamp(1.05rem, 1.45vw, 1.45rem);
		max-width: 44ch;
		margin-top: clamp(2rem, 4vh, 3.5rem);
		margin-bottom: 0;
		line-height: 1.5;
		color: var(--ink-soft);
		font-weight: 400;
		position: relative;
		z-index: 2;
		opacity: 0;
		transform: translateY(20px);
		transition: opacity 0.9s ease 0.65s, transform 0.9s ease 0.65s;
	}

	.mounted .hero-sub {
		opacity: 1;
		transform: none;
	}

	.hero-cta {
		display: flex;
		gap: 2.75rem;
		margin-top: clamp(2rem, 4vh, 3rem);
		flex-wrap: wrap;
		position: relative;
		z-index: 2;
		opacity: 0;
		transform: translateY(20px);
		transition: opacity 0.9s ease 0.85s, transform 0.9s ease 0.85s;
	}

	.mounted .hero-cta {
		opacity: 1;
		transform: none;
	}

	/* ============================================================
	   MARGIN ANNOTATIONS
	   ============================================================ */
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
		top: clamp(5vh, 8vh, 7rem);
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
		font-weight: 400;
	}

	.margin .rule {
		display: inline-block;
		width: 2.2rem;
		height: 1px;
		background: var(--ink);
	}

	.margin .rule.rule-down {
		width: 1px;
		height: 2.5rem;
		display: block;
		margin: 0 0 0.6rem 0;
	}

	.margin-tr {
		top: clamp(5vh, 8vh, 7rem);
		right: clamp(1.5rem, 6vw, 6rem);
		text-align: right;
	}

	.margin-tr .strong {
		color: var(--ink);
		font-weight: 500;
	}

	.margin-bl {
		bottom: clamp(2rem, 6vh, 5rem);
		left: clamp(1.5rem, 6vw, 6rem);
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	.meta {
		color: var(--ink-soft);
	}

	/* ============================================================
	   CTA buttons. Plain text, underline that slides on hover.
	   ============================================================ */
	.cta {
		font-family: var(--body);
		text-decoration: none;
		color: var(--ink);
		font-size: clamp(1rem, 1.2vw, 1.15rem);
		font-weight: 500;
		letter-spacing: -0.01em;
		display: inline-flex;
		align-items: baseline;
		gap: 0.55em;
		position: relative;
		padding-bottom: 6px;
	}

	.cta::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 1px;
		background: currentColor;
		transform-origin: right;
		transform: scaleX(1);
		transition: transform 0.45s cubic-bezier(0.6, 0, 0.3, 1);
	}

	.cta:hover::after {
		transform: scaleX(0);
	}

	.cta-primary {
		color: var(--accent);
	}

	.cta-ghost {
		color: var(--ink);
	}

	.cta .chev {
		font-family: var(--mono);
		display: inline-block;
		transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.cta:hover .chev {
		transform: translateX(0.4em);
	}

	.cta[href*='↗'] .chev,
	.cta-ghost .chev {
		font-size: 0.85em;
	}

	.cta-inverse {
		color: var(--ink);
	}

	.cta-inverse-ghost {
		color: var(--ink);
		opacity: 0.7;
	}

	.cta-inverse-ghost:hover {
		opacity: 1;
	}

	/* ============================================================
	   INLINE CHIP — chunky pill for inline code/monospace mentions
	   in body copy.
	   ============================================================ */
	.chip {
		font-family: var(--mono);
		font-size: 0.84em;
		background: var(--surface);
		color: var(--ink);
		padding: 0.12em 0.5em;
		border-radius: 3px;
		white-space: nowrap;
		border: 1px solid var(--hairline);
		line-height: 1.4;
	}

	.chip-dark {
		background: rgba(244, 236, 221, 0.12);
		color: var(--bg);
		border-color: rgba(244, 236, 221, 0.18);
	}

	.inline-link {
		color: var(--ink);
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 3px;
		text-decoration-color: var(--accent);
	}

	.inline-link:hover {
		color: var(--accent);
	}

	/* ============================================================
	   SPEC SHEET
	   ============================================================ */
	.spec {
		padding: clamp(5rem, 10vh, 9rem) clamp(1.5rem, 6vw, 6rem);
		border-top: 1px solid var(--hairline);
		position: relative;
		z-index: 1;
		background: var(--bg);
	}

	.spec-head {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
		margin-bottom: clamp(3rem, 6vh, 5rem);
		max-width: 100%;
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
	.dropin-head h2,
	.why-head h2 {
		font-family: var(--display);
		font-weight: 300;
		font-size: clamp(2.6rem, 7.5vw, 7rem);
		line-height: 0.92;
		letter-spacing: -0.028em;
		margin: 0;
		max-width: 18ch;
	}

	.spec-head em,
	.dropin-head em,
	.why-head em,
	.close-headline em {
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
		margin: 0.5rem 0 0;
	}

	.spec-grid {
		display: flex;
		flex-direction: column;
		border-top: 1px solid var(--hairline-strong);
	}

	.spec-row {
		display: grid;
		grid-template-columns: minmax(7rem, 16rem) 1fr minmax(11rem, 22rem);
		gap: clamp(1rem, 3vw, 3rem);
		align-items: center;
		padding: clamp(1.25rem, 2.5vh, 2rem) 0;
		border-bottom: 1px solid var(--hairline);
		opacity: 0;
		transform: translateY(20px);
		animation: rowIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
		animation-delay: calc(0.08s * var(--i, 0) + 0.1s);
	}

	@keyframes rowIn {
		to {
			opacity: 1;
			transform: none;
		}
	}

	.row-num {
		font-family: var(--display);
		font-feature-settings: 'tnum' 1, 'lnum' 1;
		font-variation-settings: 'opsz' 144;
		font-weight: 400;
		font-size: clamp(2.5rem, 5.5vw, 5rem);
		letter-spacing: -0.04em;
		line-height: 1;
		color: var(--ink);
	}

	.row-label strong {
		display: block;
		font-weight: 500;
		font-size: clamp(0.95rem, 1.05vw, 1.1rem);
		letter-spacing: -0.01em;
		color: var(--ink);
		line-height: 1.3;
	}

	.row-sub {
		font-family: var(--mono);
		color: var(--ink-soft);
		font-size: 0.74rem;
		letter-spacing: 0.04em;
		display: block;
		margin-top: 0.35rem;
		text-transform: lowercase;
	}

	.row-bar {
		display: flex;
		align-items: center;
		gap: 1rem;
		font-family: var(--mono);
		font-size: 0.85rem;
		letter-spacing: 0.04em;
	}

	.bar-track {
		flex: 1;
		height: 5px;
		background: var(--surface);
		position: relative;
		overflow: hidden;
		display: block;
		border: 1px solid var(--hairline);
		border-radius: 999px;
	}

	.bar-fill {
		position: absolute;
		inset: 0;
		background: var(--accent);
		transform-origin: left;
		transform: scaleX(0);
		animation: barFill 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
		animation-delay: calc(0.08s * var(--i, 0) + 0.45s);
	}

	@keyframes barFill {
		to {
			transform: scaleX(1);
		}
	}

	.bar-pct {
		color: var(--ink);
		font-weight: 500;
		font-variant-numeric: tabular-nums;
	}

	.bar-pct .dim {
		color: var(--ink-soft);
	}

	/* ============================================================
	   DROP-IN
	   ============================================================ */
	.dropin {
		padding: clamp(5rem, 10vh, 9rem) clamp(1.5rem, 6vw, 6rem);
		border-top: 1px solid var(--hairline);
		background: var(--surface);
		position: relative;
		z-index: 1;
	}

	.dropin-head {
		display: grid;
		grid-template-columns: 1fr minmax(0, 18rem);
		gap: 3rem;
		align-items: end;
		margin-bottom: clamp(3rem, 6vh, 5rem);
	}

	.dropin-head h2 {
		grid-column: 1 / 2;
		margin-top: 1.5rem;
	}

	.dropin-aside {
		font-family: var(--display);
		font-style: italic;
		font-size: clamp(1rem, 1.3vw, 1.3rem);
		color: var(--ink-soft);
		text-align: right;
		font-variation-settings: 'opsz' 14, 'SOFT' 100, 'WONK' 1;
		max-width: 20ch;
		justify-self: end;
		align-self: end;
	}

	.diff {
		background: #15110d;
		color: #f0e6d2;
		padding: 0;
		font-family: var(--mono);
		font-size: clamp(0.95rem, 1.35vw, 1.25rem);
		position: relative;
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
		font-size: 0.72rem;
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
		padding: 2rem 1.5rem;
		white-space: pre-wrap;
		line-height: 1.5;
		overflow-x: auto;
	}

	.diff code {
		font-family: inherit;
		font-size: inherit;
	}

	.line {
		display: block;
		padding: 0.2rem 0;
		position: relative;
	}

	.line .sigil {
		display: inline-block;
		width: 1.5em;
		opacity: 0.6;
	}

	.line.minus {
		color: #ff7766;
		background: rgba(255, 119, 102, 0.06);
	}

	.line.plus {
		color: #a8e9a4;
		background: rgba(168, 233, 164, 0.07);
	}

	.line .str {
		color: #f9b56a;
	}

	.dropin-sub {
		font-size: clamp(1.05rem, 1.3vw, 1.25rem);
		max-width: 56ch;
		color: var(--ink-soft);
		line-height: 1.55;
		margin: clamp(2.5rem, 5vh, 4rem) 0 0;
	}

	/* ============================================================
	   WHY
	   ============================================================ */
	.why {
		padding: clamp(6rem, 12vh, 10rem) clamp(1.5rem, 6vw, 6rem);
		border-top: 1px solid var(--hairline);
		background: var(--bg);
		position: relative;
		z-index: 1;
	}

	.why-head {
		margin-bottom: clamp(3rem, 7vh, 6rem);
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.why-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: 0;
		border-top: 1px solid var(--hairline-strong);
	}

	.why-item {
		display: grid;
		grid-template-columns: minmax(7rem, 14rem) 1fr;
		gap: clamp(1.5rem, 4vw, 4rem);
		padding: clamp(2rem, 4.5vh, 3.5rem) 0;
		border-bottom: 1px solid var(--hairline);
		align-items: start;
	}

	.why-num {
		font-family: var(--display);
		font-feature-settings: 'tnum' 1;
		font-style: italic;
		font-variation-settings: 'opsz' 144, 'SOFT' 100, 'WONK' 1;
		font-size: clamp(3.5rem, 7vw, 6rem);
		font-weight: 400;
		color: var(--accent);
		line-height: 0.9;
	}

	.why-body h3 {
		font-family: var(--display);
		font-weight: 400;
		font-size: clamp(1.6rem, 2.8vw, 2.8rem);
		letter-spacing: -0.025em;
		line-height: 1.1;
		margin: 0 0 1rem;
		color: var(--ink);
	}

	.why-body p {
		font-size: clamp(1.05rem, 1.25vw, 1.2rem);
		max-width: 50ch;
		line-height: 1.6;
		color: var(--ink-soft);
		margin: 0;
	}

	/* ============================================================
	   CLOSING CALL
	   ============================================================ */
	.close {
		padding: clamp(6rem, 14vh, 11rem) clamp(1.5rem, 6vw, 6rem);
		background: var(--accent);
		color: var(--ink);
		text-align: center;
		position: relative;
		z-index: 1;
		overflow: hidden;
	}

	.close::before,
	.close::after {
		content: '';
		position: absolute;
		left: 50%;
		width: 1px;
		height: 2.5rem;
		background: var(--ink);
		transform: translateX(-50%);
		opacity: 0.5;
	}

	.close::before {
		top: 0;
	}

	.close::after {
		bottom: 0;
	}

	.close-eyebrow {
		font-family: var(--display);
		font-style: italic;
		font-size: clamp(0.95rem, 1.2vw, 1.2rem);
		color: var(--ink);
		opacity: 0.7;
		margin: 0 0 1.5rem;
		font-variation-settings: 'opsz' 14, 'SOFT' 100;
	}

	.close-headline {
		font-family: var(--display);
		font-weight: 300;
		font-size: clamp(4rem, 14vw, 14rem);
		line-height: 0.9;
		letter-spacing: -0.035em;
		margin: 0 0 clamp(3rem, 6vh, 5rem);
		color: var(--ink);
	}

	.close-headline em {
		font-style: italic;
		font-variation-settings: 'opsz' 144, 'SOFT' 100, 'WONK' 1;
		color: var(--ink);
	}

	.close-actions {
		display: flex;
		justify-content: center;
		gap: 3rem;
		flex-wrap: wrap;
	}

	/* ============================================================
	   RESPONSIVE
	   ============================================================ */
	@media (max-width: 880px) {
		.spine {
			display: none;
		}
		.margin-tr {
			display: none;
		}
		.margin-tl {
			top: 1.5rem;
			left: 1.5rem;
		}
		.margin-bl {
			display: none;
		}
		.hero {
			padding-top: 6rem;
		}
		.hero-number {
			top: 5vh;
			right: -8vw;
			opacity: 0.08;
		}
		.dropin-head {
			grid-template-columns: 1fr;
		}
		.dropin-aside {
			text-align: left;
			justify-self: start;
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
		.spec-row {
			grid-template-columns: minmax(5rem, 7rem) 1fr;
		}
		.row-bar {
			grid-column: 1 / -1;
		}
		.why-item {
			grid-template-columns: 1fr;
			gap: 1rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.hero-title .line,
		.hero-sub,
		.hero-cta,
		.spec-row,
		.bar-fill {
			animation: none !important;
			transition: none !important;
			opacity: 1 !important;
			transform: none !important;
		}
		.bar-fill {
			transform: scaleX(1) !important;
		}
	}
</style>
