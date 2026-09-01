<script lang="ts">
	import { base } from '$app/paths';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import SiteNav from '$lib/components/SiteNav.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const surfaceName = (id: string) =>
		({ client: 'CSR', server: 'SSR', 'client-dev': 'CSR dev', 'server-dev': 'SSR dev' })[
			id
		] ?? id;
	const speedup = (value?: number) =>
		typeof value === 'number' && Number.isFinite(value) ? `${value.toFixed(2)}×` : '—';
	const duration = (ms?: number) => {
		if (typeof ms !== 'number' || !Number.isFinite(ms)) return '—';
		return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms.toFixed(ms < 10 ? 1 : 0)}ms`;
	};
	const printerDuration = (ms?: number) => {
		if (typeof ms !== 'number' || !Number.isFinite(ms)) return '—';
		return ms < 1 ? `${(ms * 1000).toFixed(1)}µs` : `${ms.toFixed(2)}ms`;
	};
	const formatDate = (iso: string) => {
		const date = new Date(iso);
		return Number.isNaN(date.getTime())
			? 'Unknown'
			: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
	};
	const throughputWidth = (durationMs?: number, fastestMs?: number) => {
		if (!durationMs || !fastestMs) return '0%';
		return `${Math.max(1, Math.min(100, (fastestMs / durationMs) * 100))}%`;
	};
	const relativeToRsvelte = (durationMs?: number, rsvelteMs?: number) => {
		if (!durationMs || !rsvelteMs) return '—';
		const ratio = durationMs / rsvelteMs;
		return ratio >= 1 ? `${ratio.toFixed(2)}× slower` : `${(1 / ratio).toFixed(2)}× faster`;
	};
	const correctnessPercent = (matched?: number, total?: number) => {
		if (typeof matched !== 'number' || typeof total !== 'number' || total <= 0) return '—';
		const percent = (matched / total) * 100;
		return `${percent.toFixed(matched === total || percent < 99 ? 1 : 2)}%`;
	};
	const correctnessFraction = (matched?: number, total?: number) =>
		typeof matched === 'number' && typeof total === 'number'
			? `${matched.toLocaleString('en-US')} / ${total.toLocaleString('en-US')}`
			: 'work gate passed';
	const elapsedRatio = (ratio?: number) =>
		typeof ratio === 'number' && Number.isFinite(ratio) ? `${ratio.toFixed(2)}× elapsed` : '—';
</script>

<svelte:head>
	<title>Performance · rsvelte</title>
	<meta
		name="description"
		content="Measured compiler, JavaScript printer, parser, formatter, linter, and svelte2tsx performance."
	/>
</svelte:head>

<div class="page">
	<SiteNav active="benchmark" />
	<main>
		{#if data.error || !data.results}
			<h1>Performance data is unavailable</h1>
			<p>{data.error ?? 'The benchmark report could not be loaded.'}</p>
		{:else}
			{@const report = data.results}
			<header><h1>Performance</h1></header>

			{#if report.corpus.truncated}
				<aside>Sample report — not suitable for release comparisons.</aside>
			{/if}

			<section aria-labelledby="results-title">
				<div class="section-head">
					<h2 id="results-title">Results</h2>
					<p><i></i> rsvelte parallel <span></span> reference · longer bar = higher throughput</p>
				</div>
				<div class="result-grid">
					{#each report.surfaces as surface}
						{@const group = surface.comparisonClasses.find((item) => item.variants.some((variant) => variant.id === 'rsvelte-single'))}
						{@const parallel = group?.variants.find((variant) => variant.id === 'rsvelte-multi')}
						{@const reference = group?.variants.find((variant) => variant.id === 'official')}
						<article class="result-card">
							<div class="result-head"><h3>{surfaceName(surface.id)}</h3><strong>{speedup(parallel?.speedup)}</strong></div>
							<div class="bars">
								<div class="bar-row rsvelte"><div><span>rsvelte · parallel</span><b>{duration(parallel?.medianMs)}</b></div><div class="track"><i></i></div></div>
								<div class="bar-row reference"><div><span>Svelte</span><b>{duration(reference?.medianMs)}</b></div><div class="track"><i style:width={throughputWidth(reference?.medianMs, parallel?.medianMs)}></i></div></div>
							</div>
						</article>
					{/each}

					{#each report.toolTasks as task}
						<article class="result-card">
							<div class="result-head"><h3>{task.label}</h3><strong>{speedup(task.rsvelteParallel.speedup)}</strong></div>
							<div class="bars">
								<div class="bar-row rsvelte"><div><span>{task.rsvelteParallel.label} · parallel</span><b>{duration(task.rsvelteParallel.durationMs)}</b></div><div class="track"><i></i></div></div>
								<div class="bar-row reference"><div><span>{task.reference.label}</span><b>{duration(task.reference.durationMs)}</b></div><div class="track"><i style:width={throughputWidth(task.reference.durationMs, task.rsvelteParallel.durationMs)}></i></div></div>
								{#each task.alternatives ?? [] as alternative}
									<div class="bar-row reference"><div><span>{alternative.label}{alternative.scope ? ` · ${alternative.scope}` : ''}</span><b>{duration(alternative.durationMs)}</b></div><div class="track"><i style:width={throughputWidth(alternative.durationMs, task.rsvelteParallel.durationMs)}></i></div></div>
								{/each}
							</div>
						</article>
					{/each}
				</div>
			</section>

			{#if report.printerBenchmarks}
				<section class="printers" aria-labelledby="printers-title">
					<div class="comparison-head">
						<h2 id="printers-title">JavaScript printer</h2>
						<p>Fixed generated-JavaScript workload · parsing excluded</p>
					</div>
					<div class="printer-grid">
						{#each report.printerBenchmarks.cases as benchmark}
							{@const baseline = benchmark.variants.find((variant) => variant.id === 'rsvelte-esrap')}
							<article>
								<h3>{benchmark.label}<span>{benchmark.files} {benchmark.files === 1 ? 'file' : 'files'}</span></h3>
								{#each benchmark.variants as variant}
									<div class:rsvelte-row={variant.id === 'rsvelte-esrap'} class="printer-row">
										<b>{variant.label}</b>
										<strong>{printerDuration(variant.medianMs)}</strong>
										<em>{relativeToRsvelte(variant.medianMs, baseline?.medianMs)}</em>
									</div>
								{/each}
							</article>
						{/each}
					</div>
					<p class="note">Native wall time on {report.printerBenchmarks.runner.cpuModel}, recorded {formatDate(report.printerBenchmarks.generatedAt)}. The three printers receive the same source workload and retain their parser-specific ASTs; code, decoded-map, and common-comment paths are reported separately.</p>
				</section>
			{/if}

			<section class="alternatives" aria-labelledby="alternatives-title">
				<div class="comparison-head">
					<h2 id="alternatives-title">Implementation comparison</h2>
					<p>Every row is compared directly with rsvelte on the same workload.</p>
				</div>
				<div class="alternative-grid">
					<article class="compiler-comparison">
						<h3>Compiler <span>complete-corpus attempts · always shown</span></h3>
						{#each report.surfaces as surface}
							{@const current = surface.comparisonClasses.find((item) => item.variants.some((variant) => variant.id === 'rsvelte-multi'))}
							{@const rsvelte = current?.variants.find((variant) => variant.id === 'rsvelte-multi')}
							{@const official = current?.variants.find((variant) => variant.id === 'official')}
							<div class="surface-comparison">
								<h4>{surfaceName(surface.id)} <small>{rsvelte?.attemptFiles?.toLocaleString('en-US')} inputs tested</small></h4>
								<div class="comparison-table" role="table" aria-label={`${surfaceName(surface.id)} compiler comparison`}>
									<div class="table-head" role="row"><span>Implementation</span><span>All-file time</span><span>vs rsvelte</span><span>Correctness</span></div>
									<div class="comparison-row rsvelte-row" role="row"><b>rsvelte · parallel</b><strong>{duration(rsvelte?.attemptMedianMs)}</strong><span class="baseline">baseline</span><span class="correctness"><strong>{correctnessPercent(rsvelte?.correctFiles, rsvelte?.attemptFiles)}</strong><small>{correctnessFraction(rsvelte?.correctFiles, rsvelte?.attemptFiles)}</small></span></div>
									<div class="comparison-row" role="row"><b>Svelte</b><strong>{duration(official?.attemptMedianMs)}</strong><span>{elapsedRatio(official?.attemptMedianMs && rsvelte?.attemptMedianMs ? official.attemptMedianMs / rsvelte.attemptMedianMs : undefined)}</span><span class="correctness"><strong>{correctnessPercent(official?.correctFiles, official?.attemptFiles)}</strong><small>{correctnessFraction(official?.correctFiles, official?.attemptFiles)}</small></span></div>
									{#each ['mrwaip', 'verter'] as competitorId}
										{@const group = surface.comparisonClasses.find((item) => item.variants.some((variant) => variant.id === competitorId))}
										{@const competitor = group?.variants.find((variant) => variant.id === competitorId)}
										{#if competitor}
											<div class:failed={competitor.status === 'unranked'} class="comparison-row" role="row">
												<b>{competitor.label}<small>v{competitor.version}</small></b>
												<strong>{competitor.status === 'unsupported' ? '—' : duration(competitor.attemptMedianMs)}</strong>
												<span>{competitor.status === 'unsupported' ? 'unsupported' : elapsedRatio(competitor.attemptRatioVsRsvelte)}</span>
												{#if competitor.status === 'unsupported'}
													<span>unsupported</span>
												{:else}
													<span class="correctness"><strong>{correctnessPercent(competitor.correctFiles, competitor.attemptFiles)}</strong><small>{correctnessFraction(competitor.correctFiles, competitor.attemptFiles)}</small></span>
												{/if}
											</div>
										{/if}
									{/each}
								</div>
							</div>
						{/each}
					</article>

					{#each report.toolTasks as task}
						<article class="tool-comparison">
							<h3>{task.label}<span>{task.files.toLocaleString('en-US')} files</span></h3>
							<div class="tool-row rsvelte-row"><div><b>{task.rsvelteParallel.label} · parallel</b><small>{task.rsvelteParallel.version ? `tsgo ${task.rsvelteParallel.version}` : task.id === 'lint' ? `${task.rulesCount} shared rules` : 'compatibility gate'}</small></div><strong>{duration(task.rsvelteParallel.durationMs)}</strong><em>baseline</em></div>
							<div class="tool-row"><div><b>{task.reference.label}</b><small>{task.reference.version ? `v${task.reference.version}` : task.id === 'lint' ? `${task.rulesCount} shared rules` : 'reference'}</small></div><strong>{duration(task.reference.durationMs)}</strong><em>{relativeToRsvelte(task.reference.durationMs, task.rsvelteParallel.durationMs)}</em></div>
							{#each task.alternatives ?? [] as alternative}
								<div class:failed={alternative.completedFiles !== task.files} class="tool-row"><div><b>{alternative.label}</b><small>{alternative.version ? `v${alternative.version} · ` : ''}{alternative.compatibility ? `${alternative.compatibility.matchedDiagnostics}/${alternative.compatibility.expectedDiagnostics} diagnostic checks` : `${task.files.toLocaleString('en-US')} attempts · ${alternative.completedFiles.toLocaleString('en-US')} completed`}</small></div><strong>{duration(alternative.durationMs)}</strong><em>{alternative.comparable === false ? `${alternative.scope} · separate scope` : alternative.completedFiles === task.files ? relativeToRsvelte(alternative.durationMs, task.rsvelteParallel.durationMs) : `${elapsedRatio(alternative.speedupVsRsvelteParallel)} · incomplete output`}</em></div>
							{/each}
						</article>
					{/each}
				</div>
				<p class="note">Compiler time and correctness use the same {report.corpus.measuredFiles.toLocaleString('en-US')} inputs. Accepted inputs require equivalent JS and CSS output; rejected inputs require rejection parity. Every implementation remains visible, but only 100%-correct rows count as an equivalent-work speed ranking. Tool timings require their category-specific work gate.</p>
			</section>

			<details>
				<summary>Measurement details</summary>
				<ul>
					<li>{report.runner.cpuModel} · {report.runner.cpus} CPUs</li>
					<li>{report.runner.warmups} warmup · median of {report.runner.runs} runs · recorded {formatDate(report.generatedAt)}</li>
					<li>Compiler and parser: Svelte · svelte2tsx: svelte2tsx · Formatter: Prettier · Linter: ESLint</li>
					{#each report.toolTasks as task}<li>{task.label}: {task.note}</li>{/each}
					{#each report.unsupported as item}<li>{item.label}: {item.reason}</li>{/each}
				</ul>
				<p>Versions, raw compiler samples, exclusions, and methodology are in the <a href="{base}/performance-report.json">JSON report</a>.</p>
			</details>

			<p class="links"><a href="{base}/progress">Compatibility results</a></p>
		{/if}
	</main>
	<SiteFooter />
</div>

<style>
	main { max-width: 1100px; margin: 0 auto; padding: 4rem 1.5rem 6rem; }
	header { margin-bottom: 2.5rem; }
	h1 { margin: 0 0 .65rem; font-size: clamp(2.4rem, 6vw, 4rem); letter-spacing: -.045em; }
	.note, details { color: var(--ink-soft); }
	section + section { margin-top: 3.5rem; }
	h2 { margin: 0; font-size: 1.15rem; }
	aside { margin-bottom: 1.5rem; padding: .75rem 1rem; border: 1px solid var(--warn); border-radius: 6px; color: var(--warn); font-size: .8rem; }
	.section-head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.25rem; }
	.section-head p { margin: 0; color: var(--ink-faint); font-size: .72rem; }
	.section-head i, .section-head span { display: inline-block; width: 1.25rem; height: .35rem; margin: 0 .25rem 0 .5rem; border-radius: 99px; vertical-align: middle; }
	.section-head i { margin-left: 0; background: var(--ok); }
	.section-head span { background: var(--ink-faint); }
	.result-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
	.result-card { padding: 1.45rem; border: 1px solid var(--rule); border-radius: 10px; background: var(--paper); }
	.result-head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
	.result-head h3 { margin: 0; font-size: 1.1rem; }
	.result-head strong { color: var(--ok); font-size: 1.6rem; letter-spacing: -.04em; white-space: nowrap; }
	.bars { display: grid; gap: 1rem; margin-top: 1.6rem; }
	.bar-row > div:first-child { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; }
	.bar-row span { color: var(--ink-soft); font-size: .78rem; }
	.bar-row b { font-size: 1.05rem; }
	.bar-row .track { height: .55rem; margin-top: .4rem; overflow: hidden; border-radius: 99px; background: color-mix(in srgb, var(--rule) 60%, transparent); }
	.bar-row .track i { display: block; width: 100%; height: 100%; min-width: 3px; border-radius: inherit; background: var(--ok); }
	.bar-row.reference .track i { background: var(--ink-faint); }
	.printer-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
	.printer-grid article { padding: 1.25rem; border: 1px solid var(--rule); border-radius: 10px; background: var(--paper); }
	.printer-grid h3 { display: flex; justify-content: space-between; gap: .75rem; margin: 0 0 .75rem; font-size: .95rem; }
	.printer-grid h3 span { color: var(--ink-faint); font-size: .7rem; font-weight: 400; }
	.printer-row { display: grid; grid-template-columns: 1fr auto auto; align-items: baseline; gap: .75rem; padding: .55rem 0; border-top: 1px solid var(--rule); }
	.printer-row b { font-size: .82rem; }
	.printer-row strong { font-size: .9rem; }
	.printer-row em { min-width: 6rem; color: var(--ink-faint); font-size: .7rem; font-style: normal; text-align: right; }
	.printer-row.rsvelte-row { color: var(--ok); }
	.alternatives { padding-top: 2rem; border-top: 1px solid var(--rule); }
	.comparison-head { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; margin-bottom: 1.25rem; }
	.comparison-head p { margin: 0; color: var(--ink-faint); font-size: .8rem; }
	.alternative-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
	.alternative-grid > article { padding: 1.25rem; border: 1px solid var(--rule); border-radius: 10px; background: var(--paper); }
	.alternative-grid h3 { display: flex; justify-content: space-between; gap: 1rem; margin: 0 0 .8rem; font-size: 1rem; }
	.alternative-grid h3 span { color: var(--ink-faint); font-size: .72rem; font-weight: 400; }
	.compiler-comparison { grid-column: 1 / -1; }
	.surface-comparison { padding: 1.1rem 0; }
	.surface-comparison + .surface-comparison { border-top: 1px solid var(--rule); }
	.surface-comparison h4 { display: flex; align-items: baseline; gap: .65rem; margin: 0 0 .65rem; font-size: 1.05rem; }
	.surface-comparison h4 small { color: var(--ink-faint); font-size: .7rem; font-weight: 400; }
	.comparison-table { overflow: hidden; border: 1px solid var(--rule); border-radius: 8px; }
	.table-head, .comparison-row { display: grid; grid-template-columns: minmax(12rem, 1.4fr) minmax(6rem, .65fr) minmax(7rem, .75fr) minmax(10rem, 1fr); gap: 1rem; align-items: center; padding: .75rem 1rem; }
	.table-head { color: var(--ink-faint); background: color-mix(in srgb, var(--rule) 25%, transparent); font-size: .68rem; font-weight: 650; text-transform: uppercase; letter-spacing: .06em; }
	.comparison-row + .comparison-row { border-top: 1px solid var(--rule); }
	.comparison-row b { font-size: .9rem; }
	.comparison-row b small { display: block; margin-top: .12rem; color: var(--ink-faint); font-size: .65rem; font-weight: 400; }
	.comparison-row strong { font-size: 1rem; }
	.comparison-row > span { color: var(--ink-soft); font-size: .78rem; }
	.comparison-row .correctness { display: flex; align-items: baseline; gap: .45rem; }
	.comparison-row .correctness strong { color: var(--ink); font-size: 1rem; }
	.comparison-row .correctness small { color: var(--ink-soft); font-size: .75rem; }
	.rsvelte-row { background: color-mix(in srgb, var(--ok) 7%, transparent); }
	.rsvelte-row strong, .baseline { color: var(--ok) !important; }
	.failed { background: color-mix(in srgb, var(--warn) 5%, transparent); }
	.failed strong, .failed > span:nth-last-child(2) { color: var(--warn); }
	.tool-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: .15rem 1rem; align-items: center; padding: .85rem; border-radius: 7px; }
	.tool-row + .tool-row { margin-top: .35rem; }
	.tool-row div { min-width: 0; }
	.tool-row b { display: block; font-size: .9rem; }
	.tool-row small { display: block; margin-top: .15rem; color: var(--ink-faint); font-size: .68rem; }
	.tool-row strong { font-size: 1.05rem; }
	.tool-row em { grid-column: 1 / -1; color: var(--ink-soft); font-size: .72rem; font-style: normal; }
	.note { margin: .9rem 0 0; font-size: .8rem; line-height: 1.5; }
	details { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid var(--rule); font-size: .8rem; }
	summary { color: var(--ink); cursor: pointer; font-weight: 650; }
	details li { margin: .45rem 0; line-height: 1.5; }
	details a, .links a { color: var(--accent); }
	.links { margin-top: 1.5rem; font-size: .82rem; }
	@media (max-width: 820px) { .alternative-grid, .printer-grid { grid-template-columns: 1fr; } .section-head, .comparison-head { align-items: flex-start; flex-direction: column; } .comparison-table { overflow-x: auto; } .table-head, .comparison-row { min-width: 680px; } }
	@media (max-width: 640px) { main { padding: 3rem 1rem 5rem; } .result-grid { grid-template-columns: 1fr; } .result-card { padding: 1.2rem; } .section-head p { line-height: 1.7; } }
</style>
