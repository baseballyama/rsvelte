<script lang="ts">
	import { base } from '$app/paths';
	import type { PageData } from './$types';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import SiteNav from '$lib/components/SiteNav.svelte';

	let { data }: { data: PageData } = $props();

	const percentage = (matched: number | null, total: number | null) =>
		matched === null || total === null || total === 0 ? null : (matched / total) * 100;
	const formatDate = (iso: string) =>
		new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
</script>

<svelte:head>
	<title>Compatibility · rsvelte</title>
	<meta name="description" content="Current rsvelte compatibility across the parser, compiler, formatter, svelte2tsx, and linter." />
</svelte:head>

<div class="page">
	<SiteNav active="progress" />
	<main>
		{#if data.error || !data.compatibility}
			<h1>Compatibility data is unavailable</h1>
			<p>{data.error}</p>
		{:else}
			{@const report = data.compatibility}
			<header>
				<h1>Compatibility</h1>
				<p class="lede"><strong>{report.summary.exact.toLocaleString('en-US')} / {report.summary.total.toLocaleString('en-US')}</strong> real-world files match Svelte in CSR, SSR, CSR dev, and SSR dev. Parser, formatter, svelte2tsx, and lint are tracked separately below.</p>
			</header>

			<section class="summary" aria-label="Compatibility summary">
				<div><strong>{report.summary.percentage.toFixed(3)}%</strong><span>exact across all 4 compiler modes</span></div>
				<div><strong>{report.corpus.configuredFiles.toLocaleString('en-US')}</strong><span>real-world files</span></div>
				<div><strong class:good={report.summary.unparseable === 0}>{report.summary.unparseable}</strong><span>invalid JS outputs</span></div>
			</section>

			<section class="surfaces" aria-label="Compatibility by surface">
				{#each report.surfaces as surface}
					{@const value = percentage(surface.matched, surface.total)}
					<article>
						<div class="surface-head">
							<h2>{surface.label}</h2>
							<span class:pass={surface.status === 'pass'} class:difference={surface.status === 'differences'}>{surface.status === 'pass' ? 'Exact' : surface.status === 'differences' ? 'Differences' : 'Unmeasured'}</span>
						</div>
						{#if value !== null}
							<strong class="score">{value.toFixed(value === 100 ? 0 : 2)}%</strong>
							<p>{surface.matched?.toLocaleString('en-US')} / {surface.total?.toLocaleString('en-US')} {surface.unit}</p>
							<div class="track" aria-hidden="true"><i style:width={`${value}%`}></i></div>
						{:else}
							<strong class="score">—</strong>
							<p>{surface.differences.toLocaleString('en-US')} known differences</p>
						{/if}
						<small>{surface.differences === 0 && surface.total !== null ? 'No differences' : `${surface.differences.toLocaleString('en-US')} ${surface.unit} differ`} · {surface.note}</small>
					</article>
				{/each}
			</section>

			<details class="competitors">
				<summary>Other compiler implementations · output parity</summary>
				{#each report.competitors as competitor}
					<div class="competitor-row">
						<strong>{competitor.label}</strong>
						{#each competitor.surfaces as surface}
							<span>{surface.label} {surface.status === 'unsupported' ? '—' : surface.total ? `${((surface.matched / surface.total) * 100).toFixed(1)}%` : '—'}</span>
						{/each}
					</div>
				{/each}
				<p>Normalized JavaScript AST and CSS output compared with the matching Svelte version.</p>
				{#each report.unmeasuredCompetitors as competitor}
					<p><strong>{competitor.label}</strong>: not measured — {competitor.reason}</p>
				{/each}
			</details>

			<details>
				<summary>How these numbers are measured</summary>
				<p>Compiler modes compare normalized JavaScript and CSS against Svelte. Parser uses the official fixture suite. fmt, svelte2tsx, and lint use their own oracle comparisons because their outputs have different units.</p>
				<p>Corpus: {report.corpus.sourceCount} pinned projects · updated {formatDate(report.generatedAt)} · <a href="{base}/compatibility-report.json">raw report</a></p>
			</details>
		{/if}
	</main>
	<SiteFooter />
</div>

<style>
	main { max-width: 980px; margin: 0 auto; padding: 5rem 1.5rem 6rem; }
	header { max-width: 760px; }
	h1 { margin: 0 0 1rem; font-size: clamp(2.7rem, 7vw, 4rem); line-height: 1; letter-spacing: -.05em; }
	.lede { color: var(--ink-soft); font-size: 1.1rem; line-height: 1.7; }
	.lede strong { color: var(--ink); }
	.summary { display: grid; grid-template-columns: repeat(3, 1fr); margin-top: 2.5rem; border: 1px solid var(--rule); border-radius: 10px; overflow: hidden; }
	.summary div { padding: 1.2rem; border-right: 1px solid var(--rule); }
	.summary div:last-child { border: 0; }
	.summary strong, .summary span { display: block; }
	.summary strong { font-size: 1.55rem; letter-spacing: -.03em; }
	.summary span { margin-top: .2rem; color: var(--ink-soft); font-size: .78rem; }
	.good { color: var(--ok); }
	.surfaces { display: grid; grid-template-columns: 1fr 1fr; gap: .8rem; margin-top: 3rem; }
	article { padding: 1.25rem; border: 1px solid var(--rule); border-radius: 10px; background: var(--paper); }
	.surface-head { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
	h2 { margin: 0; font-size: 1rem; }
	.surface-head span { padding: .22rem .48rem; border-radius: 999px; background: var(--rule); color: var(--ink-soft); font-size: .66rem; font-weight: 700; text-transform: uppercase; }
	.surface-head span.pass { color: var(--ok); background: color-mix(in srgb, var(--ok) 10%, transparent); }
	.surface-head span.difference { color: var(--warn); background: color-mix(in srgb, var(--warn) 10%, transparent); }
	.score { display: block; margin-top: 1.4rem; font-size: 2rem; letter-spacing: -.045em; }
	article p { margin-top: .15rem; color: var(--ink-soft); font-size: .8rem; }
	.track { height: 3px; margin: 1rem 0; overflow: hidden; border-radius: 99px; background: var(--rule); }
	.track i { display: block; height: 100%; background: var(--accent); }
	article small { display: block; margin-top: 1rem; color: var(--ink-faint); line-height: 1.45; }
	details { margin-top: 3rem; padding-top: 1.25rem; border-top: 1px solid var(--rule); color: var(--ink-soft); font-size: .85rem; }
	summary { color: var(--ink); cursor: pointer; font-weight: 650; }
	details p { max-width: 720px; margin-top: .8rem; line-height: 1.6; }
	details a { color: var(--accent); }
	.competitors { margin-top: 3rem; }
	.competitor-row { display: grid; grid-template-columns: minmax(170px, 1.4fr) repeat(4, 1fr); gap: .75rem; padding: .9rem 0; border-bottom: 1px solid var(--rule); align-items: center; }
	.competitor-row span { color: var(--ink-soft); font-size: .78rem; }
	@media (max-width: 640px) { main { padding: 3rem 1rem 5rem; } .summary { grid-template-columns: 1fr; } .summary div { border-right: 0; border-bottom: 1px solid var(--rule); } .surfaces { grid-template-columns: 1fr; } .competitor-row { grid-template-columns: 1fr 1fr; } .competitor-row strong { grid-column: 1 / -1; } }
</style>
