<script lang="ts">
	import { base } from '$app/paths';
	import type { PageData } from './$types';
	import type { TestCase } from '$lib/types/test-results';
	import SiteNav from '$lib/components/SiteNav.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';

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
</svelte:head>

<div class="page">
	<SiteNav active="progress" />

	{#if data.error}
		<section class="empty">
			<p class="eyebrow"><span class="rule"></span>Compatibility · unavailable</p>
			<h1>Test results not generated.</h1>
			<p class="lede">{data.error}</p>
			<pre class="empty-code"><code><span class="c-cmt"># From the repo root</span>
<span class="c-prompt">$</span> cargo run <span class="c-flag">--release --bin</span> test_reporter <span class="c-op">--</span> <span class="c-op">\</span>
    <span class="c-flag">--output</span> docs/static/test-results.json</code></pre>
		</section>
	{:else if data.results}
		{@const r = data.results}

		<header class="hero">
			<p class="eyebrow"><span class="rule"></span>Compatibility · live report</p>

			<h1 class="title">
				<span class="ink-svelte">{Math.round(r.summary.percentage)}%</span> of the official
				<code>sveltejs/svelte</code> suite, passing.
			</h1>

			<dl class="hero-meta">
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
				<div>
					<dt>Recorded</dt>
					<dd class="mono">{formatDate(r.generated_at)}</dd>
				</div>
				<div>
					<dt>Against</dt>
					<dd class="mono"><code>sveltejs/svelte@{r.commit_sha}</code></dd>
				</div>
			</dl>
		</header>

		<section class="spec">
			<div class="section-head">
				<span class="num">01</span>
				<h2>Every <em>category</em>, verified.</h2>
				<p class="lede">
					Click any row to filter the fixture list below. Numbers reflect the official Svelte
					test fixtures run locally against <code>{r.commit_sha}</code>.
				</p>
			</div>

			<div class="spec-list">
				{#each r.categories as cat, i (cat.id)}
					<button
						class="spec-row"
						class:active={selectedCategoryId === cat.id}
						style="--i: {i};"
						onclick={() => toggleCategory(cat.id)}
					>
						<span class="spec-k">{cat.name}</span>
						<span class="spec-v">
							<span class="spec-n">
								{cat.passed}<span class="spec-n-sep">/</span><span class="spec-n-tot"
									>{cat.total - cat.skipped}</span
								>
							</span>
							<span class="spec-s">
								{#if cat.skipped > 0}
									{cat.skipped} skipped — out of scope
								{:else if cat.percentage >= 100}
									all fixtures green
								{:else}
									{cat.total - cat.passed - cat.skipped} regressions
								{/if}
							</span>
						</span>
						<span class="spec-bar">
							<span class="bar-track">
								<span
									class="bar-fill"
									class:warn={cat.percentage < 100 && cat.percentage >= 50}
									class:bad={cat.percentage < 50}
									style="width: {Math.max(2, cat.percentage)}%;"
								></span>
							</span>
							<span class="spec-pct"
								>{Math.round(cat.percentage)}<span class="dim">%</span></span
							>
						</span>
					</button>
				{/each}
			</div>
		</section>

		<section class="fixtures">
			<div class="section-head">
				<span class="num">02</span>
				<h2>The <em>full</em> fixture list.</h2>
				{#if selectedCategoryId}
					<button class="clear-filter" onclick={() => (selectedCategoryId = null)}>
						<span aria-hidden="true">←</span> Clear filter
					</button>
				{/if}
			</div>

			<div class="filters">
				<label class="search">
					<span class="search-sigil" aria-hidden="true">⌕</span>
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
						<div
							class="fix-row"
							class:fail={test.status === 'fail'}
							class:skip={test.status === 'skip'}
						>
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

	.mono {
		font-family: 'Fira Mono', monospace;
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
		line-height: 1.06;
		letter-spacing: -0.025em;
		color: var(--ink);
		margin: 0;
		max-width: 28ch;
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
		gap: 2rem 2.4rem;
		margin-top: 2rem;
		padding-top: 1.4rem;
		border-top: 1px solid var(--rule);
	}

	.hero-meta > div {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
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
		gap: 0.45rem;
		margin: 0;
		font-size: 0.95rem;
		color: var(--ink);
	}

	.hero-meta .big {
		font-family: 'Overpass', sans-serif;
		font-weight: 800;
		font-size: 1.6rem;
		font-variant-numeric: tabular-nums;
		line-height: 1;
		letter-spacing: -0.02em;
	}

	.hero-meta .dim {
		font-family: 'Fira Mono', monospace;
		font-size: 0.78rem;
		color: var(--ink-soft);
	}

	.hero-meta code {
		color: var(--rust);
		font-size: 0.88em;
	}

	/* SPEC / CATEGORIES */
	.spec {
		max-width: 1080px;
		margin: 0 auto;
	}

	.section-head {
		max-width: 1080px;
		padding: clamp(3rem, 7vh, 4.5rem) clamp(1rem, 4vw, 2.5rem) clamp(1.4rem, 3vh, 2rem);
		display: grid;
		grid-template-columns: auto 1fr auto;
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

	.section-head .lede {
		grid-row: 2;
		grid-column: 2;
		margin-top: 0.7rem;
		font-size: clamp(1rem, 1.2vw, 1.1rem);
		color: var(--ink-soft);
		max-width: 64ch;
	}

	.section-head .lede code {
		font-size: 0.88em;
		padding: 0.06em 0.4em;
		background: var(--paper);
		border: 1px solid var(--rule);
		border-radius: 3px;
		color: var(--rust);
	}

	.spec-list {
		padding: 0 clamp(1rem, 4vw, 2.5rem) clamp(2.5rem, 5vh, 3.5rem);
	}

	.spec-row {
		display: grid;
		grid-template-columns: minmax(10rem, 14rem) minmax(0, 1fr) minmax(10rem, 14rem);
		gap: 1.4rem;
		align-items: baseline;
		width: 100%;
		padding: 1rem 0;
		border: 0;
		border-bottom: 1px solid var(--rule);
		background: transparent;
		text-align: left;
		font: inherit;
		color: inherit;
		cursor: pointer;
		opacity: 0;
		transform: translateY(6px);
		animation: rowIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
		animation-delay: calc(0.04s * var(--i, 0) + 0.05s);
		transition: padding-left 0.2s ease;
	}

	.spec-row:first-child {
		border-top: 1px solid var(--rule);
	}

	.spec-row:hover {
		padding-left: 0.4rem;
	}

	.spec-row.active {
		padding-left: 0.6rem;
		background: color-mix(in srgb, var(--svelte) 5%, transparent);
		border-left: 2px solid var(--svelte);
	}

	@keyframes rowIn {
		to {
			opacity: 1;
			transform: none;
		}
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
		min-width: 0;
	}

	.spec-n {
		font-family: 'Overpass', sans-serif;
		font-weight: 700;
		font-size: 1.2rem;
		color: var(--ink);
		font-variant-numeric: tabular-nums;
		letter-spacing: -0.015em;
	}

	.spec-n-sep {
		color: var(--ink-faint);
		margin: 0 0.1em;
	}

	.spec-n-tot {
		color: var(--ink-soft);
		font-size: 0.78em;
	}

	.spec-s {
		font-family: 'Fira Mono', monospace;
		font-size: 0.74rem;
		color: var(--ink-soft);
	}

	.spec-bar {
		display: flex;
		align-items: center;
		gap: 0.7rem;
	}

	.bar-track {
		flex: 1;
		height: 6px;
		background: var(--paper);
		border: 1px solid var(--rule);
		border-radius: 999px;
		overflow: hidden;
		display: block;
	}

	.bar-fill {
		display: block;
		height: 100%;
		background: var(--svelte);
		transform-origin: left;
		width: 0;
		animation: barIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
		animation-delay: calc(0.04s * var(--i, 0) + 0.25s);
	}

	.bar-fill.warn {
		background: var(--warn);
	}

	.bar-fill.bad {
		background: var(--bad);
	}

	@keyframes barIn {
		from {
			transform: scaleX(0);
		}
		to {
			transform: scaleX(1);
		}
	}

	.spec-pct {
		font-family: 'Fira Mono', monospace;
		font-size: 0.82rem;
		color: var(--ink);
		font-variant-numeric: tabular-nums;
		min-width: 3.4rem;
		text-align: right;
	}

	.spec-pct .dim {
		color: var(--ink-faint);
	}

	/* FIXTURES */
	.fixtures {
		max-width: 1080px;
		margin: 0 auto;
		padding-bottom: clamp(4rem, 8vh, 6rem);
	}

	.fixtures .section-head h2 em {
		color: var(--svelte);
	}

	.clear-filter {
		grid-row: 1;
		grid-column: 3;
		justify-self: end;
		align-self: center;
		background: transparent;
		border: 1px solid var(--rule-strong);
		border-radius: 4px;
		padding: 0.45rem 0.85rem;
		font-family: 'Fira Mono', monospace;
		font-size: 0.74rem;
		color: var(--ink);
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		gap: 0.4em;
		transition: background 0.18s, color 0.18s, border-color 0.18s;
	}

	.clear-filter:hover {
		background: var(--ink);
		color: var(--bg);
		border-color: var(--ink);
	}

	.filters {
		max-width: 1080px;
		margin: 0 auto 1.4rem;
		padding: 0 clamp(1rem, 4vw, 2.5rem);
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
		align-items: stretch;
	}

	.search {
		flex: 1;
		min-width: 14rem;
		display: flex;
		align-items: center;
		gap: 0.65rem;
		padding: 0 1rem;
		background: var(--bg);
		border: 1px solid var(--rule-strong);
		border-radius: 4px;
		font-family: 'Fira Mono', monospace;
	}

	.search:focus-within {
		border-color: var(--svelte);
		outline: 2px solid color-mix(in srgb, var(--svelte) 30%, transparent);
		outline-offset: -1px;
	}

	.search-sigil {
		color: var(--ink-faint);
		font-size: 1rem;
	}

	.search input {
		flex: 1;
		padding: 0.7rem 0;
		background: transparent;
		border: 0;
		font: inherit;
		font-size: 0.86rem;
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
		border: 1px solid var(--rule-strong);
		border-radius: 4px;
		background: var(--bg);
		overflow: hidden;
	}

	.status-tabs button {
		font-family: 'Fira Mono', monospace;
		font-size: 0.72rem;
		letter-spacing: 0.06em;
		padding: 0 1rem;
		background: transparent;
		border: 0;
		color: var(--ink-soft);
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		gap: 0.45em;
		border-right: 1px solid var(--rule);
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

	.dot.pass {
		background: var(--ok);
	}

	.dot.fail {
		background: var(--bad);
	}

	.dot.skip {
		background: var(--warn);
	}

	.fix-table {
		max-width: 1080px;
		margin: 0 auto;
		padding: 0 clamp(1rem, 4vw, 2.5rem);
	}

	.fix-thead {
		display: grid;
		grid-template-columns: 1fr 12rem 7rem;
		gap: 1rem;
		padding: 0.7rem 1rem;
		font-family: 'Fira Mono', monospace;
		font-size: 0.66rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--ink-faint);
		background: var(--paper);
		border: 1px solid var(--rule);
		border-top-left-radius: 6px;
		border-top-right-radius: 6px;
		border-bottom: 0;
	}

	.fix-tbody {
		max-height: 540px;
		overflow-y: auto;
		font-variant-numeric: tabular-nums;
		border-inline: 1px solid var(--rule);
		background: var(--bg);
	}

	.fix-row {
		display: grid;
		grid-template-columns: 1fr 12rem 7rem;
		gap: 1rem;
		padding: 0.65rem 1rem;
		font-family: 'Fira Mono', monospace;
		font-size: 0.8rem;
		border-bottom: 1px solid var(--rule);
		align-items: center;
	}

	.fix-row:hover {
		background: var(--paper);
	}

	.fix-name {
		color: var(--ink);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.fix-cat {
		color: var(--ink-soft);
		font-size: 0.76rem;
	}

	.fix-status {
		display: inline-flex;
		align-items: center;
		gap: 0.45em;
		color: var(--ok);
	}

	.fix-row.fail .fix-status {
		color: var(--bad);
	}

	.fix-row.skip .fix-status {
		color: var(--warn);
	}

	.fix-glyph {
		font-size: 0.9em;
		line-height: 1;
	}

	.fix-msg {
		grid-column: 1 / -1;
		margin: 0.4rem 0 0;
		padding: 0.55rem 0.7rem;
		background: var(--paper);
		font-family: 'Fira Mono', monospace;
		font-size: 0.74rem;
		color: var(--ink-soft);
		white-space: pre-wrap;
		word-break: break-word;
		border-left: 2px solid var(--rule-strong);
	}

	.fix-row.fail .fix-msg {
		border-left-color: var(--bad);
	}

	.fix-row.skip .fix-msg {
		border-left-color: var(--warn);
	}

	.fix-empty {
		padding: 3rem 1rem;
		text-align: center;
		color: var(--ink-faint);
		font-family: 'Fira Mono', monospace;
		font-size: 0.82rem;
	}

	.fix-foot {
		padding: 0.7rem 1rem;
		background: var(--paper);
		border: 1px solid var(--rule);
		border-top: 0;
		border-bottom-left-radius: 6px;
		border-bottom-right-radius: 6px;
		font-family: 'Fira Mono', monospace;
		font-size: 0.78rem;
		color: var(--ink);
		display: flex;
		gap: 0.5em;
	}

	.fix-foot .dim {
		color: var(--ink-soft);
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
		max-width: 700px;
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

	/* RESPONSIVE */
	@media (max-width: 880px) {
		.section-head {
			grid-template-columns: auto 1fr;
		}
		.clear-filter {
			grid-column: 1 / -1;
			justify-self: start;
		}
		.spec-row {
			grid-template-columns: 1fr auto;
			gap: 0.4rem 1rem;
		}
		.spec-v {
			grid-column: 1 / -1;
		}
		.spec-bar {
			grid-column: 1 / -1;
		}
		.fix-thead,
		.fix-row {
			grid-template-columns: 1fr;
			gap: 0.3rem;
		}
		.fix-thead {
			display: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.spec-row,
		.bar-fill {
			animation: none !important;
			opacity: 1 !important;
			transform: none !important;
		}
	}
</style>
