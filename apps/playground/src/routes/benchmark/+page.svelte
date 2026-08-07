<script lang="ts">
	import { base } from '$app/paths';
	import type { PageData } from './$types';
	import type { BenchmarkTaskResults } from '$lib/types/benchmark';
	import CodeBlock from '$lib/components/CodeBlock.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import SiteNav from '$lib/components/SiteNav.svelte';

	let { data }: { data: PageData } = $props();

	type TaskId = 'full' | 'full-ssr' | 'parse' | 'svelte2tsx' | 'fmt' | 'lint' | 'svelte-check';
	type TaskGroup = 'compiler' | 'ecosystem';

	type TaskRow = {
		id: TaskId;
		label: string;
		description: string;
		group: TaskGroup;
		baseline: string;
		data: BenchmarkTaskResults;
	};

	const formatDate = (iso: string): string =>
		new Date(iso).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});

	const formatDuration = (ms: number): string => {
		if (ms < 1) return `${(ms * 1000).toFixed(1)} μs`;
		if (ms < 1000) return `${ms.toFixed(1)} ms`;
		return `${(ms / 1000).toFixed(2)} s`;
	};

	const tasks: TaskRow[] = $derived.by(() => {
		if (!data.results) return [];
		const r = data.results;
		const rows: TaskRow[] = [
			{
				id: 'full',
				label: 'Compile (client)',
				description: 'Parse, analyze, and generate DOM code',
				group: 'compiler',
				baseline: 'svelte/compiler',
				data: r
			}
		];

		if (r.compileServer) {
			rows.push({
				id: 'full-ssr',
				label: 'Compile (server)',
				description: 'Parse, analyze, and generate HTML',
				group: 'compiler',
				baseline: 'svelte/compiler',
				data: r.compileServer
			});
		}

		rows.push({
			id: 'parse',
			label: 'Parse only',
			description: 'Compiler phase 1 in isolation',
			group: 'compiler',
			baseline: 'svelte/compiler',
			data: r.parse
		});

		if (r.svelte2tsx) {
			rows.push({
				id: 'svelte2tsx',
				label: 'svelte2tsx',
				description: 'Generate TypeScript from Svelte source',
				group: 'ecosystem',
				baseline: 'svelte2tsx',
				data: r.svelte2tsx
			});
		}
		if (r.fmt) {
			rows.push({
				id: 'fmt',
				label: 'Format',
				description: 'Format Svelte source files',
				group: 'ecosystem',
				baseline: 'prettier-plugin-svelte',
				data: r.fmt
			});
		}
		if (r.lint) {
			rows.push({
				id: 'lint',
				label: 'Lint',
				description: `${r.lint.rulesCount} rules shared by both implementations`,
				group: 'ecosystem',
				baseline: 'eslint-plugin-svelte',
				data: r.lint
			});
		}
		if (r.svelteCheck) {
			rows.push({
				id: 'svelte-check',
				label: 'svelte-check',
				description: `${r.svelteCheck.filesCount.toLocaleString('en-US')}-file workspace`,
				group: 'ecosystem',
				baseline: 'svelte-check',
				data: r.svelteCheck
			});
		}

		return rows;
	});

	const groups: { key: TaskGroup; title: string; description: string }[] = [
		{ key: 'compiler', title: 'Compiler', description: 'Core Svelte compilation tasks.' },
		{ key: 'ecosystem', title: 'Ecosystem tools', description: 'Tools built around the compiler.' }
	];

	const tasksByGroup = $derived(
		groups
			.map((group) => ({ ...group, rows: tasks.filter((task) => task.group === group.key) }))
			.filter((group) => group.rows.length > 0)
	);

	const generateData = `cargo build --release
pnpm run generate-benchmark
pnpm run dev:docs`;
</script>

<svelte:head>
	<title>Benchmark · rsvelte</title>
	<meta
		name="description"
		content="Compilation speed benchmark — rsvelte against the official Svelte compiler and ecosystem tools."
	/>
</svelte:head>

<div class="page">
	<SiteNav active="benchmark" />

	<main class="report">
		{#if data.error}
			<nav class="breadcrumbs" aria-label="Breadcrumb">
				<a href="{base}/">Documentation</a><span>/</span><span>Benchmark</span>
			</nav>
			<h1>Benchmark data is unavailable</h1>
			<p class="intro">{data.error}</p>
			<div class="command"><CodeBlock code={generateData} lang="bash" caption="Terminal" /></div>
		{:else if data.results}
			{@const r = data.results}

			<header class="report-header">
				<nav class="breadcrumbs" aria-label="Breadcrumb">
					<a href="{base}/">Documentation</a><span>/</span><span>Benchmark</span>
				</nav>
				<h1>Benchmark</h1>
				<p class="intro">
					Results from running the official JavaScript tools and rsvelte against the same source
					corpus. Lower durations are better.
				</p>

				<dl class="metadata">
					<div>
						<dt>Corpus</dt>
						<dd>{r.testFilesCount.toLocaleString('en-US')} Svelte files</dd>
					</div>
					{#if r.runner}
						<div>
							<dt>Machine</dt>
							<dd>{r.runner.cpus}-core {r.runner.arch} · {r.runner.label}</dd>
						</div>
					{/if}
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

			<section class="results" aria-labelledby="results-heading">
				<h2 id="results-heading">Results</h2>
				<p class="section-description">
					Each duration is the total time for the corpus. Speedup compares multi-threaded rsvelte
					with the JavaScript baseline.
				</p>

				{#each tasksByGroup as group (group.key)}
					<section class="result-group" aria-labelledby="{group.key}-heading">
						<div class="group-heading">
							<h3 id="{group.key}-heading">{group.title}</h3>
							<p>{group.description}</p>
						</div>
						<div class="table-scroll">
							<table>
								<caption class="visually-hidden">{group.title} benchmark results</caption>
								<thead>
									<tr>
										<th scope="col">Task</th>
										<th scope="col">JavaScript</th>
										<th scope="col">rsvelte, single thread</th>
										<th scope="col">rsvelte, multi-thread</th>
										<th scope="col">Speedup</th>
									</tr>
								</thead>
								<tbody>
									{#each group.rows as task (task.id)}
										<tr>
											<th scope="row">
												<span class="task-name">{task.label}</span>
												<span class="task-description">{task.description}</span>
											</th>
											<td>
												<span class="duration">{formatDuration(task.data.javascript.durationMs)}</span>
												<span class="implementation">{task.baseline}</span>
											</td>
											<td>{formatDuration(task.data.rustSingleThread.durationMs)}</td>
											<td>{formatDuration(task.data.rustMultiThread.durationMs)}</td>
											<td class="speedup">{task.data.speedup.multiThreadVsJs.toFixed(1)}×</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</section>
				{/each}
			</section>

			<section class="reproduce" aria-labelledby="reproduce-heading">
				<h2 id="reproduce-heading">Run the benchmark locally</h2>
				<p>Generate a fresh result file and open this report in the local documentation site.</p>
				<div class="command"><CodeBlock code={generateData} lang="bash" caption="Terminal" /></div>
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
	h3,
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
		max-width: 68ch;
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

	.metadata code {
		font-family: var(--font-code);
	}

	.results {
		margin-top: 3.5rem;
	}

	h2 {
		margin-bottom: 0.45rem;
		font-size: 1.45rem;
		letter-spacing: -0.02em;
	}

	.section-description,
	.reproduce > p {
		max-width: 70ch;
		margin-bottom: 1.8rem;
		font-size: 0.9rem;
		line-height: 1.6;
		color: var(--ink-soft);
	}

	.result-group + .result-group {
		margin-top: 2.5rem;
	}

	.group-heading {
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
		margin-bottom: 0.65rem;
	}

	.group-heading h3 {
		margin-bottom: 0;
		font-size: 1rem;
	}

	.group-heading p {
		margin-bottom: 0;
		font-size: 0.8rem;
		color: var(--ink-faint);
	}

	.table-scroll {
		overflow-x: auto;
		border: 1px solid var(--rule);
		border-radius: 6px;
		background: var(--bg);
	}

	table {
		width: 100%;
		min-width: 720px;
		border-collapse: collapse;
		font-size: 0.82rem;
		font-variant-numeric: tabular-nums;
	}

	th,
	td {
		padding: 0.8rem 0.9rem;
		border-bottom: 1px solid var(--rule);
		text-align: right;
		vertical-align: top;
		white-space: nowrap;
	}

	thead th {
		background: var(--paper);
		font-family: var(--font-ui);
		font-size: 0.72rem;
		font-weight: 600;
		line-height: 1.35;
		color: var(--ink-soft);
		white-space: normal;
	}

	th:first-child,
	td:first-child {
		text-align: left;
	}

	tbody th {
		width: 30%;
		font-weight: 500;
		white-space: normal;
	}

	tbody tr:last-child th,
	tbody tr:last-child td {
		border-bottom: 0;
	}

	.task-name,
	.task-description,
	.implementation {
		display: block;
	}

	.task-description,
	.implementation {
		margin-top: 0.2rem;
		font-size: 0.7rem;
		font-weight: 400;
		line-height: 1.45;
		color: var(--ink-faint);
	}

	.duration {
		display: block;
	}

	.speedup {
		font-weight: 650;
		color: var(--ok);
	}

	tbody tr:hover {
		background: color-mix(in srgb, var(--paper) 55%, transparent);
	}

	.reproduce {
		margin-top: 4rem;
		padding-top: 2.5rem;
		border-top: 1px solid var(--rule);
	}

	.command {
		max-width: 720px;
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

	@media (max-width: 760px) {
		.report {
			padding-top: 2rem;
		}

		.metadata {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.group-heading {
			display: block;
		}

		.group-heading p {
			margin-top: 0.2rem;
		}
	}
</style>
