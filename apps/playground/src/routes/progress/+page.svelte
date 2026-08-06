<script lang="ts">
	import { base } from '$app/paths';
	import type { PageData } from './$types';
	import CodeBlock from '$lib/components/CodeBlock.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import SiteNav from '$lib/components/SiteNav.svelte';

	let { data }: { data: PageData } = $props();

	let selectedCategoryId = $state<string | null>(null);
	let searchQuery = $state('');
	let statusFilter = $state<'all' | 'pass' | 'fail' | 'skip'>('all');

	const toggleCategory = (categoryId: string) => {
		selectedCategoryId = selectedCategoryId === categoryId ? null : categoryId;
	};

	const formatDate = (isoString: string): string =>
		new Date(isoString).toLocaleString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});

	const allTests = $derived(
		(data.results?.categories ?? []).flatMap((category) =>
			category.tests.map((test) => ({
				...test,
				categoryId: category.id,
				categoryName: category.name
			}))
		)
	);

	const categoryOptions = $derived(
		(data.results?.categories ?? []).map((category) => ({
			id: category.id,
			name: category.name
		}))
	);

	const filteredTests = $derived(
		allTests
			.filter((test) => {
				if (selectedCategoryId && test.categoryId !== selectedCategoryId) return false;
				if (statusFilter !== 'all' && test.status !== statusFilter) return false;
				if (searchQuery) {
					const query = searchQuery.toLowerCase();
					return (
						test.name.toLowerCase().includes(query) ||
						test.categoryName.toLowerCase().includes(query)
					);
				}
				return true;
			})
			.sort((a, b) => {
				const order = { fail: 0, skip: 1, pass: 2 };
				return order[a.status] - order[b.status] || a.name.localeCompare(b.name);
			})
	);

	const filtersActive = $derived(
		selectedCategoryId !== null || searchQuery.length > 0 || statusFilter !== 'all'
	);

	const resetFilters = () => {
		selectedCategoryId = null;
		searchQuery = '';
		statusFilter = 'all';
	};

	const generateData =
		'cargo run --release -p rsvelte_devtools --bin test_reporter -- --output apps/playground/static/test-results.json';
</script>

<svelte:head>
	<title>Compatibility · rsvelte</title>
	<meta
		name="description"
		content="Compatibility results from running the official Svelte test suite against rsvelte."
	/>
</svelte:head>

<div class="page">
	<SiteNav active="progress" />

	<main class="report">
		{#if data.error}
			<nav class="breadcrumbs" aria-label="Breadcrumb">
				<a href="{base}/">Documentation</a><span>/</span><span>Compatibility</span>
			</nav>
			<h1>Compatibility data is unavailable</h1>
			<p class="intro">{data.error}</p>
			<div class="command"><CodeBlock code={generateData} lang="bash" caption="Terminal" /></div>
		{:else if data.results}
			{@const r = data.results}

			<header class="report-header">
				<nav class="breadcrumbs" aria-label="Breadcrumb">
					<a href="{base}/">Documentation</a><span>/</span><span>Compatibility</span>
				</nav>
				<h1>Compatibility</h1>
				<p class="intro">
					Results from running rsvelte against the official Svelte compiler fixtures. Skipped
					fixtures are outside the current project scope.
				</p>

				<dl class="metadata">
					<div>
						<dt>Passing</dt>
						<dd>{r.summary.passed.toLocaleString('en-US')} / {(r.summary.total - r.summary.skipped).toLocaleString('en-US')}</dd>
					</div>
					<div>
						<dt>Compatibility</dt>
						<dd>{r.summary.percentage.toFixed(1)}%</dd>
					</div>
					<div>
						<dt>Recorded</dt>
						<dd>{formatDate(r.generated_at)}</dd>
					</div>
					<div>
						<dt>Upstream commit</dt>
						<dd><code>{r.commit_sha}</code></dd>
					</div>
				</dl>
			</header>

			<section class="categories" aria-labelledby="categories-heading">
				<h2 id="categories-heading">Test suites</h2>
				<p class="section-description">
					Select a suite to filter the fixture list. Passing counts exclude skipped fixtures.
				</p>

				<div class="table-scroll">
					<table class="category-table">
						<caption class="visually-hidden">Compatibility by test suite</caption>
						<thead>
							<tr>
								<th scope="col">Suite</th>
								<th scope="col">Passing</th>
								<th scope="col">Skipped</th>
								<th scope="col">Result</th>
							</tr>
						</thead>
						<tbody>
							{#each r.categories as category (category.id)}
								<tr class:selected={selectedCategoryId === category.id}>
									<th scope="row">
						<button
							type="button"
							class="category-button"
											aria-pressed={selectedCategoryId === category.id}
											onclick={() => toggleCategory(category.id)}
										>
											{category.name}
										</button>
									</th>
									<td>{category.passed.toLocaleString('en-US')} / {(category.total - category.skipped).toLocaleString('en-US')}</td>
									<td>{category.skipped ? category.skipped.toLocaleString('en-US') : '—'}</td>
									<td>
										<span class:passing={category.failed === 0} class:failing={category.failed > 0}>
											{category.failed === 0 ? 'Pass' : `${category.failed} failing`}
										</span>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</section>

			<section class="fixtures" aria-labelledby="fixtures-heading">
				<div class="fixture-heading">
					<div>
						<h2 id="fixtures-heading">Fixtures</h2>
						<p class="section-description" aria-live="polite">
							Showing {filteredTests.length.toLocaleString('en-US')} of {allTests.length.toLocaleString('en-US')} fixtures.
						</p>
					</div>
					{#if filtersActive}
						<button type="button" class="reset-filters" onclick={resetFilters}>Reset filters</button>
					{/if}
				</div>

				<div class="filters">
					<label class="field search">
						<span>Search</span>
						<span class="search-control">
							<svg viewBox="0 0 16 16" aria-hidden="true">
								<circle cx="7" cy="7" r="4.25"></circle>
								<path d="m10.25 10.25 3 3"></path>
							</svg>
							<input type="search" placeholder="Fixture or suite name" bind:value={searchQuery} />
						</span>
					</label>
					<label class="field suite-select">
						<span>Suite</span>
						<span class="select-control">
							<select bind:value={selectedCategoryId}>
								<option value={null}>All suites</option>
								{#each categoryOptions as option (option.id)}
									<option value={option.id}>{option.name}</option>
								{/each}
							</select>
							<svg class="select-chevron" viewBox="0 0 16 16" aria-hidden="true">
								<path d="m4 6 4 4 4-4"></path>
							</svg>
						</span>
					</label>
					<div class="status-filter" role="group" aria-label="Status filter">
						<span class="filter-label">Status</span>
						<div class="status-buttons">
							{#each [
								{ value: 'all', label: 'All' },
								{ value: 'pass', label: 'Pass' },
								{ value: 'fail', label: 'Fail' },
								{ value: 'skip', label: 'Skipped' }
							] as option (option.value)}
								<button
									type="button"
									class:active={statusFilter === option.value}
									aria-pressed={statusFilter === option.value}
									onclick={() => (statusFilter = option.value as typeof statusFilter)}
								>
									{option.label}
								</button>
							{/each}
						</div>
					</div>
				</div>

				<div class="table-scroll fixture-table-wrap">
					<table class="fixture-table">
						<caption class="visually-hidden">Filtered fixture compatibility results</caption>
						<thead>
							<tr>
								<th scope="col">Fixture</th>
								<th scope="col">Suite</th>
								<th scope="col">Status</th>
							</tr>
						</thead>
						<tbody>
							{#each filteredTests as test (test.categoryId + '/' + test.name)}
								<tr>
									<th scope="row">
										<span class="fixture-name">{test.name}</span>
										{#if test.error_message || test.skip_reason}
											<span class="fixture-message">{test.error_message || test.skip_reason}</span>
										{/if}
									</th>
									<td>{test.categoryName}</td>
									<td><span class="test-status status-{test.status}">{test.status === 'skip' ? 'Skipped' : test.status === 'pass' ? 'Pass' : 'Fail'}</span></td>
								</tr>
							{/each}
							{#if filteredTests.length === 0}
								<tr><td class="no-results" colspan="3">No fixtures match these filters.</td></tr>
							{/if}
						</tbody>
					</table>
				</div>
			</section>
		{/if}
	</main>

	<SiteFooter />
</div>

<style>
	.page {
		min-height: 100vh;
	}

	.report {
		width: min(100% - 2rem, 1100px);
		margin: 0 auto;
		padding: 2.75rem 0 5rem;
	}

	.breadcrumbs {
		display: flex;
		gap: 0.45rem;
		align-items: center;
		margin-bottom: 1.4rem;
		font-size: 0.8rem;
		color: var(--ink-faint);
	}

	.breadcrumbs a {
		color: var(--ink-soft);
		text-decoration: none;
	}

	.breadcrumbs a:hover {
		color: var(--accent);
		text-decoration: underline;
	}

	h1,
	h2,
	p {
		margin-top: 0;
	}

	h1 {
		margin-bottom: 0.7rem;
		font-size: clamp(2rem, 4vw, 2.75rem);
		line-height: 1.15;
		letter-spacing: -0.035em;
	}

	.intro {
		max-width: 70ch;
		margin-bottom: 0;
		font-size: 1rem;
		line-height: 1.65;
		color: var(--ink-soft);
	}

	.metadata {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 1.5rem;
		margin: 2rem 0 0;
		padding: 1.1rem 0;
		border-top: 1px solid var(--rule);
		border-bottom: 1px solid var(--rule);
	}

	.metadata dt {
		margin-bottom: 0.25rem;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--ink-faint);
	}

	.metadata dd {
		margin: 0;
		font-size: 0.82rem;
		line-height: 1.45;
		color: var(--ink);
	}

	.metadata code,
	.fixture-message {
		font-family: var(--font-code);
	}

	.categories,
	.fixtures {
		margin-top: 3.5rem;
	}

	h2 {
		margin-bottom: 0.45rem;
		font-size: 1.45rem;
		letter-spacing: -0.02em;
	}

	.section-description {
		max-width: 72ch;
		margin-bottom: 1.25rem;
		font-size: 0.9rem;
		line-height: 1.55;
		color: var(--ink-soft);
	}

	.table-scroll {
		overflow-x: auto;
		border: 1px solid var(--rule);
		border-radius: 6px;
		background: var(--bg);
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.82rem;
		font-variant-numeric: tabular-nums;
	}

	th,
	td {
		padding: 0.75rem 0.9rem;
		border-bottom: 1px solid var(--rule);
		text-align: left;
		vertical-align: top;
	}

	thead th {
		background: var(--paper);
		font-size: 0.72rem;
		font-weight: 600;
		color: var(--ink-soft);
	}

	tbody th {
		font-weight: 500;
	}

	tbody tr:last-child th,
	tbody tr:last-child td {
		border-bottom: 0;
	}

	.category-table {
		min-width: 620px;
	}

	.category-table th:first-child {
		width: 48%;
	}

	.category-table tr.selected {
		background: color-mix(in srgb, var(--accent) 6%, transparent);
		box-shadow: inset 2px 0 var(--accent);
	}

	.category-button {
		display: block;
		width: 100%;
		padding: 0;
		border: 0;
		background: none;
		font: inherit;
		font-weight: 550;
		color: var(--ink);
		text-align: left;
		cursor: pointer;
	}

	.category-button:hover {
		color: var(--accent);
		text-decoration: underline;
	}

	.category-button:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 3px;
		border-radius: 2px;
	}

	.passing {
		color: var(--ok);
	}

	.failing,
	.status-fail {
		color: var(--danger);
	}

	.fixture-heading {
		display: flex;
		align-items: start;
		justify-content: space-between;
		gap: 1rem;
	}

	.reset-filters {
		height: 2rem;
		padding: 0 0.7rem;
		border: 1px solid var(--rule-strong);
		border-radius: 5px;
		background: var(--bg);
		font: inherit;
		font-size: 0.8rem;
		color: var(--ink-soft);
		cursor: pointer;
	}

	.reset-filters:hover {
		border-color: var(--ink-faint);
		background: var(--paper);
		color: var(--ink);
	}

	.filters {
		display: grid;
		grid-template-columns: minmax(220px, 1fr) minmax(170px, 0.55fr) auto;
		gap: 1rem;
		align-items: end;
		margin: 0 0 1rem;
	}

	.field,
	.status-filter {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.field > span:first-child,
	.filter-label {
		font-size: 0.72rem;
		font-weight: 600;
		color: var(--ink-soft);
	}

	.search-control,
	.select-control {
		position: relative;
		display: block;
	}

	input,
	select {
		width: 100%;
		height: 2.5rem;
		box-sizing: border-box;
		padding: 0 0.7rem;
		border: 1px solid var(--rule-strong);
		border-radius: 5px;
		background: var(--bg);
		font: inherit;
		font-size: 0.82rem;
		color: var(--ink);
	}

	input[type='search'] {
		padding-left: 2.1rem;
	}

	.search-control svg,
	.select-chevron {
		position: absolute;
		top: 50%;
		pointer-events: none;
		transform: translateY(-50%);
		color: var(--ink-faint);
	}

	.search-control svg {
		left: 0.65rem;
		width: 1rem;
		height: 1rem;
		fill: none;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-width: 1.25;
	}

	select {
		appearance: none;
		padding-right: 2.25rem;
		cursor: pointer;
	}

	.select-chevron {
		right: 0.65rem;
		width: 1rem;
		height: 1rem;
		fill: none;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 1.5;
	}

	input:focus,
	select:focus {
		outline: 2px solid color-mix(in srgb, var(--accent) 45%, transparent);
		outline-offset: 2px;
		border-color: var(--accent);
	}

	.reset-filters:focus-visible,
	.status-buttons button:focus-visible {
		position: relative;
		z-index: 1;
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}

	.status-buttons {
		display: flex;
		height: 2.5rem;
		border: 1px solid var(--rule-strong);
		border-radius: 5px;
		overflow: hidden;
	}

	.status-buttons button {
		padding: 0 0.65rem;
		border: 0;
		border-right: 1px solid var(--rule);
		background: var(--bg);
		font: inherit;
		font-size: 0.78rem;
		color: var(--ink-soft);
		cursor: pointer;
	}

	.status-buttons button:last-child {
		border-right: 0;
	}

	.status-buttons button:hover {
		color: var(--ink);
		background: var(--paper);
	}

	.status-buttons button.active {
		background: var(--paper);
		box-shadow: inset 0 -2px var(--accent);
		color: var(--ink);
		font-weight: 600;
	}

	.fixture-table-wrap {
		max-height: 650px;
		overflow: auto;
		scrollbar-gutter: stable;
	}

	.fixture-table {
		min-width: 720px;
	}

	.fixture-table thead {
		position: sticky;
		top: 0;
		z-index: 1;
	}

	.fixture-table th:first-child {
		width: 55%;
	}

	.fixture-name,
	.fixture-message {
		display: block;
	}

	.fixture-message {
		margin-top: 0.3rem;
		font-size: 0.7rem;
		font-weight: 400;
		line-height: 1.45;
		color: var(--ink-faint);
		white-space: pre-wrap;
	}

	.test-status {
		font-family: var(--font-ui);
		font-weight: 550;
		text-transform: capitalize;
	}

	.status-pass {
		color: var(--ok);
	}

	.status-skip {
		color: var(--ink-faint);
	}

	.no-results {
		padding: 2rem;
		text-align: center;
		color: var(--ink-faint);
	}

	.command {
		max-width: 760px;
		margin-top: 1.5rem;
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
		border: 0;
	}

	@media (max-width: 820px) {
		.metadata {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.filters {
			grid-template-columns: 1fr 1fr;
		}

		.status-filter {
			grid-column: 1 / -1;
		}

		.status-buttons {
			align-self: flex-start;
		}
	}

	@media (max-width: 560px) {
		.report {
			padding-top: 2rem;
		}

		.filters {
			grid-template-columns: 1fr;
		}

		.status-filter {
			grid-column: auto;
		}

		.fixture-heading {
			display: block;
		}
	}
</style>
