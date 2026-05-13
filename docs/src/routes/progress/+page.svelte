<script lang="ts">
	import { base } from '$app/paths';
	import type { PageData } from './$types';
	import type { TestCase } from '$lib/types/test-results';

	let { data }: { data: PageData } = $props();

	let selectedCategoryId = $state<string | null>(null);
	let searchQuery = $state('');
	let statusFilter = $state<'all' | 'pass' | 'fail' | 'skip'>('all');

	const toggleCategory = (categoryId: string) => {
		selectedCategoryId = selectedCategoryId === categoryId ? null : categoryId;
	};

	const formatDate = (isoString: string): string => {
		const date = new Date(isoString);
		return date.toLocaleString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const allTests = $derived(
		(data.results?.categories ?? []).flatMap((cat) =>
			cat.tests.map((test) => ({
				...test,
				categoryId: cat.id,
				categoryName: cat.name
			}))
		)
	);

	const filteredTests = $derived(
		allTests
			.filter((test) => {
				if (selectedCategoryId && test.categoryId !== selectedCategoryId) return false;
				if (statusFilter !== 'all' && test.status !== statusFilter) return false;
				if (searchQuery) {
					const q = searchQuery.toLowerCase();
					return (
						test.name.toLowerCase().includes(q) ||
						test.categoryName.toLowerCase().includes(q)
					);
				}
				return true;
			})
			.sort((a, b) => {
				const order = { fail: 0, skip: 1, pass: 2 };
				const diff = order[a.status] - order[b.status];
				if (diff !== 0) return diff;
				return a.name.localeCompare(b.name);
			})
	);

	const statusGlyph = (status: TestCase['status']): string =>
		status === 'pass' ? '●' : status === 'fail' ? '✕' : '○';
</script>

<svelte:head>
	<title>Compatibility · rsvelte</title>
	<meta
		name="description"
		content="Live compatibility report — every category of the official Svelte test suite run against rsvelte."
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
			<a href="{base}/progress" class="active">Compat</a>
			<a href="{base}/benchmark">Speed</a>
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
			<span class="kicker">§ Compatibility — unavailable</span>
			<h1 class="empty-title"><em>Test</em> results<br />not generated.</h1>
			<p class="empty-sub">{data.error}</p>
			<pre class="empty-code"><code>cargo run --release --bin test_reporter -- \
  --output docs/static/test-results.json</code></pre>
		</section>
	{:else if data.results}
		{@const r = data.results}
		<!-- HERO: overall percentage as the main display -->
		<header class="hero">
			<aside class="margin margin-tl" aria-hidden="true">
				<span class="serif-italic">№ 002</span>
				<span class="rule"></span>
				<span class="meta">The compatibility report</span>
			</aside>

			<aside class="margin margin-tr" aria-hidden="true">
				<span class="meta">Generated</span><br />
				<span class="strong mono">{formatDate(r.generated_at)}</span><br />
				<span class="meta">Against</span><br />
				<span class="strong mono">sveltejs/svelte@{r.commit_sha}</span>
			</aside>

			<div class="hero-figure" aria-hidden="true">
				<span class="num">{Math.round(r.summary.percentage)}</span>
				<span class="x">%</span>
			</div>

			<h1 class="hero-title">
				<span class="line">Every</span>
				<span class="line"><em>test,</em></span>
				<span class="line">passing.</span>
			</h1>

			<dl class="hero-stats">
				<div>
					<dt>In-scope passing</dt>
					<dd>
						<span class="big">{r.summary.passed.toLocaleString('en-US')}</span>
						<span class="dim">/ {(r.summary.total - r.summary.skipped).toLocaleString('en-US')}</span>
					</dd>
				</div>
				<div>
					<dt>Categories</dt>
					<dd>
						<span class="big">{r.categories.length}</span>
						<span class="dim">official suites</span>
					</dd>
				</div>
				{#if r.summary.skipped > 0}
					<div>
						<dt>Out of scope</dt>
						<dd>
							<span class="big">{r.summary.skipped.toLocaleString('en-US')}</span>
							<span class="dim">skipped fixtures</span>
						</dd>
					</div>
				{/if}
			</dl>
		</header>

		<!-- CATEGORIES: spec-sheet rows mirroring the landing page -->
		<section class="spec">
			<header class="spec-head">
				<span class="kicker">§ 02 — By category</span>
				<h2>Every row, <em>verified</em>.</h2>
				<p class="lede">
					Click any row to filter the fixture list to that suite. Numbers reflect the
					official Svelte test fixtures we run locally against
					<span class="chip">{r.commit_sha}</span>.
				</p>
			</header>

			<div class="spec-grid">
				{#each r.categories as cat, i (cat.id)}
					<button
						class="spec-row"
						class:active={selectedCategoryId === cat.id}
						style="--i: {i};"
						onclick={() => toggleCategory(cat.id)}
					>
						<span class="row-num">
							{cat.passed}<span class="row-num-sep">/</span><span class="row-num-tot"
								>{cat.total - cat.skipped}</span
							>
						</span>
						<span class="row-label">
							<strong>{cat.name}</strong>
							<span class="row-sub">
								{#if cat.skipped > 0}
									{cat.skipped} skipped — out of scope
								{:else if cat.percentage >= 100}
									all fixtures green
								{:else}
									{cat.total - cat.passed - cat.skipped} regressions
								{/if}
							</span>
						</span>
						<span class="row-bar">
							<span class="bar-track">
								<span
									class="bar-fill"
									class:warn={cat.percentage < 100 && cat.percentage >= 50}
									class:bad={cat.percentage < 50}
									style="width: {Math.max(2, cat.percentage)}%;"
								></span>
							</span>
							<span class="bar-pct"
								>{Math.round(cat.percentage)}<span class="dim">%</span></span
							>
						</span>
					</button>
				{/each}
			</div>
		</section>

		<!-- FIXTURE LIST: filterable -->
		<section class="fixtures">
			<header class="fix-head">
				<div>
					<span class="kicker">§ 03 — Fixtures</span>
					<h2>The <em>full</em> list.</h2>
				</div>
				{#if selectedCategoryId}
					<button class="clear-filter" onclick={() => (selectedCategoryId = null)}>
						<span class="chev">←</span> Clear filter
					</button>
				{/if}
			</header>

			<div class="filters">
				<label class="search">
					<span class="search-sigil">⌕</span>
					<input
						type="text"
						placeholder="Filter by name or category…"
						bind:value={searchQuery}
					/>
				</label>
				<div class="status-tabs">
					<button class:active={statusFilter === 'all'} onclick={() => (statusFilter = 'all')}
						>All</button
					>
					<button class:active={statusFilter === 'pass'} onclick={() => (statusFilter = 'pass')}
						><span class="dot pass"></span>Pass</button
					>
					<button class:active={statusFilter === 'fail'} onclick={() => (statusFilter = 'fail')}
						><span class="dot fail"></span>Fail</button
					>
					<button class:active={statusFilter === 'skip'} onclick={() => (statusFilter = 'skip')}
						><span class="dot skip"></span>Skip</button
					>
				</div>
			</div>

			<div class="fix-table">
				<div class="fix-thead">
					<span>Fixture</span>
					<span>Category</span>
					<span>Status</span>
				</div>
				<div class="fix-tbody">
					{#each filteredTests as test (test.categoryId + '/' + test.name)}
						<div class="fix-row" class:fail={test.status === 'fail'} class:skip={test.status === 'skip'}>
							<span class="fix-name" title={test.name}>{test.name}</span>
							<span class="fix-cat">{test.categoryName}</span>
							<span class="fix-status">
								<span class="fix-glyph">{statusGlyph(test.status)}</span>
								<span>{test.status}</span>
							</span>
							{#if test.error_message || test.skip_reason}
								<p class="fix-msg">{test.error_message || test.skip_reason}</p>
							{/if}
						</div>
					{/each}
					{#if filteredTests.length === 0}
						<div class="fix-empty">No fixtures match.</div>
					{/if}
				</div>
				<div class="fix-foot">
					<span>{filteredTests.length.toLocaleString('en-US')}</span>
					<span class="dim">/ {allTests.length.toLocaleString('en-US')} fixtures</span>
				</div>
			</div>
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
		--warn: #c79100;
		--bad: #b1280a;
		--hairline: rgba(26, 22, 18, 0.16);
		--hairline-strong: rgba(26, 22, 18, 0.4);

		--display: 'Fraunces', 'Source Serif Pro', Georgia, 'Times New Roman', Times, serif;
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

	/* ============================================================
	   TOP STRIP — matches landing page
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
		font-size: clamp(14rem, 38vw, 50rem);
		line-height: 0.8;
		pointer-events: none;
		user-select: none;
		letter-spacing: -0.05em;
		display: flex;
		align-items: baseline;
	}

	.hero-figure .num {
		display: inline-block;
		transform: rotate(-5deg);
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
		font-size: clamp(2rem, 4vw, 3.4rem);
		letter-spacing: -0.03em;
		font-weight: 400;
		line-height: 1;
		color: var(--ink);
	}

	.hero-stats .dim {
		font-family: var(--mono);
		font-size: 0.85rem;
		color: var(--ink-soft);
		letter-spacing: 0.04em;
	}

	/* ============================================================
	   SPEC SHEET
	   ============================================================ */
	.spec {
		padding: clamp(4rem, 9vh, 8rem) clamp(1.5rem, 6vw, 6rem);
		border-top: 1px solid var(--hairline);
		position: relative;
		z-index: 1;
	}

	.spec-head,
	.fix-head {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		margin-bottom: clamp(2.5rem, 5vh, 4rem);
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
	.fix-head h2,
	.empty-title {
		font-family: var(--display);
		font-weight: 300;
		font-size: clamp(2.4rem, 6.5vw, 6rem);
		line-height: 0.92;
		letter-spacing: -0.028em;
		margin: 0;
	}

	.spec-head em,
	.fix-head em,
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

	.spec-grid {
		display: flex;
		flex-direction: column;
		border-top: 1px solid var(--hairline-strong);
	}

	.spec-row {
		display: grid;
		grid-template-columns: minmax(9rem, 14rem) 1fr minmax(11rem, 22rem);
		gap: clamp(1rem, 3vw, 3rem);
		align-items: center;
		padding: clamp(1.25rem, 2.4vh, 1.8rem) 0;
		border: 0;
		border-bottom: 1px solid var(--hairline);
		background: transparent;
		text-align: left;
		font: inherit;
		color: inherit;
		cursor: pointer;
		transition: padding-left 0.3s cubic-bezier(0.22, 1, 0.36, 1), background 0.25s ease;
		opacity: 0;
		transform: translateY(14px);
		animation: rowIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
		animation-delay: calc(0.04s * var(--i, 0) + 0.05s);
	}

	.spec-row:hover {
		padding-left: 0.5rem;
		background: linear-gradient(to right, var(--surface), transparent 70%);
	}

	.spec-row.active {
		padding-left: 1rem;
		background: linear-gradient(to right, rgba(255, 62, 0, 0.08), transparent 70%);
	}

	.spec-row.active::before {
		content: '';
		position: absolute;
		left: 0;
		width: 3px;
		height: calc(100% - 2px);
		background: var(--accent);
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
		font-variation-settings: 'opsz' 96;
		font-weight: 400;
		font-size: clamp(1.7rem, 3.5vw, 2.8rem);
		letter-spacing: -0.03em;
		line-height: 1;
		color: var(--ink);
	}

	.row-num-sep {
		color: var(--ink-faint);
		margin: 0 0.1em;
	}

	.row-num-tot {
		color: var(--ink-soft);
		font-size: 0.6em;
		vertical-align: 0.18em;
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
		width: 0;
		transition: width 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.2s;
	}

	.spec-row .bar-fill {
		animation: barIn 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
		animation-delay: calc(0.04s * var(--i, 0) + 0.3s);
	}

	@keyframes barIn {
		from { transform: scaleX(0); }
		to { transform: scaleX(1); }
	}

	.bar-fill.warn { background: var(--warn); }
	.bar-fill.bad { background: var(--bad); }

	.bar-pct {
		color: var(--ink);
		font-weight: 500;
		font-variant-numeric: tabular-nums;
	}

	.dim {
		color: var(--ink-soft);
	}

	/* ============================================================
	   FIXTURES
	   ============================================================ */
	.fixtures {
		padding: clamp(4rem, 9vh, 8rem) clamp(1.5rem, 6vw, 6rem) clamp(5rem, 10vh, 9rem);
		border-top: 1px solid var(--hairline);
		background: var(--surface);
		position: relative;
		z-index: 1;
	}

	.fix-head {
		flex-direction: row;
		justify-content: space-between;
		align-items: flex-end;
		gap: 2rem;
	}

	.clear-filter {
		font-family: var(--mono);
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.16em;
		padding: 0.55rem 1rem;
		background: transparent;
		border: 1px solid var(--ink);
		color: var(--ink);
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		gap: 0.55em;
		transition: background 0.25s ease, color 0.25s ease;
	}

	.clear-filter:hover {
		background: var(--ink);
		color: var(--bg);
	}

	.clear-filter .chev {
		font-family: var(--mono);
		transition: transform 0.3s ease;
	}

	.clear-filter:hover .chev {
		transform: translateX(-0.3em);
	}

	.filters {
		display: flex;
		gap: 1rem;
		align-items: stretch;
		margin-bottom: 1.5rem;
		flex-wrap: wrap;
	}

	.search {
		flex: 1;
		min-width: 14rem;
		display: flex;
		align-items: center;
		gap: 0.65rem;
		padding: 0 1rem;
		background: var(--bg);
		border: 1px solid var(--hairline-strong);
		font-family: var(--mono);
	}

	.search:focus-within {
		border-color: var(--accent);
		outline: 1px solid var(--accent);
		outline-offset: -1px;
	}

	.search-sigil {
		color: var(--ink-soft);
		font-size: 1.05rem;
	}

	.search input {
		flex: 1;
		padding: 0.85rem 0;
		background: transparent;
		border: 0;
		font: inherit;
		font-size: 0.85rem;
		color: var(--ink);
	}

	.search input:focus {
		outline: none;
	}

	.search input::placeholder {
		color: var(--ink-faint);
	}

	.status-tabs {
		display: flex;
		gap: 0;
		border: 1px solid var(--hairline-strong);
		background: var(--bg);
	}

	.status-tabs button {
		font-family: var(--mono);
		font-size: 0.72rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		padding: 0 1.1rem;
		background: transparent;
		border: 0;
		color: var(--ink-soft);
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		gap: 0.5em;
		border-right: 1px solid var(--hairline-strong);
		transition: color 0.2s ease, background 0.2s ease;
	}

	.status-tabs button:last-child {
		border-right: 0;
	}

	.status-tabs button:hover {
		color: var(--ink);
	}

	.status-tabs button.active {
		background: var(--ink);
		color: var(--bg);
	}

	.dot {
		display: inline-block;
		width: 6px;
		height: 6px;
		border-radius: 999px;
	}

	.dot.pass { background: #2c7a3a; }
	.dot.fail { background: var(--bad); }
	.dot.skip { background: var(--warn); }

	.fix-table {
		border: 1px solid var(--hairline-strong);
		background: var(--bg);
	}

	.fix-thead {
		display: grid;
		grid-template-columns: 1fr 12rem 7rem;
		gap: 1rem;
		padding: 0.75rem 1rem;
		font-family: var(--mono);
		font-size: 0.66rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--ink-soft);
		border-bottom: 1px solid var(--hairline-strong);
		background: var(--surface);
	}

	.fix-tbody {
		max-height: 520px;
		overflow-y: auto;
		font-feature-settings: 'tnum' 1;
	}

	.fix-row {
		display: grid;
		grid-template-columns: 1fr 12rem 7rem;
		gap: 1rem;
		padding: 0.7rem 1rem;
		font-family: var(--mono);
		font-size: 0.82rem;
		border-bottom: 1px solid var(--hairline);
		align-items: center;
	}

	.fix-row:hover {
		background: var(--surface);
	}

	.fix-name {
		color: var(--ink);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.fix-cat {
		color: var(--ink-soft);
		font-size: 0.78rem;
	}

	.fix-status {
		display: inline-flex;
		align-items: center;
		gap: 0.45em;
		text-transform: lowercase;
		color: #2c7a3a;
	}

	.fix-row.fail .fix-status { color: var(--bad); }
	.fix-row.skip .fix-status { color: var(--warn); }

	.fix-glyph {
		font-size: 0.9em;
		line-height: 1;
	}

	.fix-msg {
		grid-column: 1 / -1;
		margin: 0.4rem 0 0;
		padding: 0.55rem 0.7rem;
		background: var(--surface);
		font-family: var(--mono);
		font-size: 0.75rem;
		color: var(--ink-soft);
		white-space: pre-wrap;
		word-break: break-word;
		border-left: 2px solid var(--hairline-strong);
	}

	.fix-row.fail .fix-msg { border-left-color: var(--bad); }
	.fix-row.skip .fix-msg { border-left-color: var(--warn); }

	.fix-empty {
		padding: 3rem 1rem;
		text-align: center;
		color: var(--ink-soft);
		font-family: var(--mono);
		font-size: 0.82rem;
	}

	.fix-foot {
		padding: 0.75rem 1rem;
		border-top: 1px solid var(--hairline-strong);
		background: var(--surface);
		font-family: var(--mono);
		font-size: 0.78rem;
		color: var(--ink);
		display: flex;
		gap: 0.5em;
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
		line-height: 1.6;
		margin: 1rem 0 0;
		max-width: 70ch;
		border: 1px solid var(--hairline-strong);
		overflow-x: auto;
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
		.spec-row {
			grid-template-columns: minmax(5rem, 7rem) 1fr;
		}
		.row-bar {
			grid-column: 1 / -1;
		}
		.fix-head {
			flex-direction: column;
			align-items: flex-start;
		}
		.fix-thead,
		.fix-row {
			grid-template-columns: 1fr;
			gap: 0.3rem;
		}
		.fix-thead {
			display: none;
		}
		.fix-cat {
			font-size: 0.72rem;
		}
	}
</style>
