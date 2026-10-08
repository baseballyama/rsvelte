<script lang="ts">
	import CrateDiagram from '$lib/components/CrateDiagram.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { REPO_URL, chaptersIn } from '$lib/site';
	import SpanFigure from '$lib/widgets/SpanFigure.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const fmt = (n: number) => n.toLocaleString('en-US');
	const mb = (b: number) => (b / 1e6).toFixed(1);
	const pct = (a: number, b: number) => ((a / b) * 100).toFixed(1);
	const sum = (v: Record<string, number>) => Object.values(v).reduce((a, b) => a + b, 0);
	const VERDICTS = [
		{ key: 'match', label: 'Match', dot: 'bg-ok' },
		{ key: 'mismatch', label: 'Mismatch', dot: 'bg-line-strong' },
		{ key: 'unparseable', label: 'Output that does not parse', dot: 'bg-warn' },
		{ key: 'unexpected', label: 'Output that upstream does not produce', dot: 'bg-accent' },
		{ key: 'missing', label: 'Rejected as unsupported', dot: 'bg-fg-2/25' }
	];
	const arm = (name: string) => {
		const a = data.benchmark.arms.find((x) => x.name === name);
		if (!a) throw new Error(`no arm ${name}`);
		return a;
	};
	const maxMs = $derived(Math.max(...data.benchmark.arms.map((a) => a.median)));
	const armNote: Record<string, string> = {
		shared: 'The tasks of a document share computed results',
		isolated: 'Each task computes everything again',
		nopool: 'No buffer pool',
		serial: '1 thread',
		streaming: 'Drops each result as soon as it is final'
	};

	// Every figure in the hero is a ratio of two arms from the same benchmark run; nothing here is typed in.
	const stats = $derived([
		{
			value: `${arm('shared').median.toFixed(1)}`,
			unit: 'ms',
			label: `${data.benchmark.tasks} tasks on ${fmt(data.benchmark.documents)} documents (${mb(data.benchmark.bytes)} megabytes)`,
			detail: `Median of ${data.benchmark.rounds} rounds on ${data.benchmark.threads} threads`
		},
		{
			value: `${(arm('isolated').median / arm('shared').median).toFixed(1)}`,
			unit: '×',
			label: 'Gain from sharing the parse',
			detail: `${arm('isolated').median.toFixed(0)} ms when each task computes everything again`
		},
		{
			value: `${(arm('serial').median / arm('shared').median).toFixed(1)}`,
			unit: '×',
			label: 'Gain from running documents in parallel',
			detail: `${arm('serial').median.toFixed(0)} ms on 1 thread`
		},
		{
			value: `${mb(arm('streaming').peak)}`,
			unit: 'megabytes',
			label: 'Peak memory growth with streaming',
			detail: `${mb(arm('shared').peak)} megabytes when all results are kept`
		}
	]);

	const groups = $derived.by(() => {
		const first = chaptersIn('en').findIndex((c) => c.module);
		const last = chaptersIn('en').findLastIndex((c) => c.module);
		if (first < 0) return [{ title: 'Chapters', items: chaptersIn('en') }];
		return [
			{ title: 'Start here', items: chaptersIn('en').slice(0, first) },
			{ title: 'Kernel modules', items: chaptersIn('en').slice(first, last + 1) },
			{ title: 'Measure and improve', items: chaptersIn('en').slice(last + 1) }
		].filter((g) => g.items.length > 0);
	});
	const totalMinutes = chaptersIn('en').reduce((n, c) => n + c.minutes, 0);

	const command = 'cargo run --release -p rsvelte_command_line -- run Counter.svelte --task svelte.compile/client';
	let copied = $state(false);
	async function copy() {
		await navigator.clipboard.writeText(command);
		copied = true;
		setTimeout(() => (copied = false), 1200);
	}
</script>

<svelte:head>
	<title>rsvelte — the Svelte toolchain on one kernel</title>
	<meta
		name="description"
		content="rsvelte is an experimental implementation that runs Svelte 5 compiling, formatting, linting, and type checking on one Rust kernel."
	/>
</svelte:head>

<main>
	<section class="relative overflow-hidden border-b border-line">
		<div class="hero-grid pointer-events-none absolute inset-0" aria-hidden="true"></div>
		<div class="relative mx-auto max-w-[1440px] px-4 pt-12 pb-14 md:px-8 md:pt-20 md:pb-20">
			<a
				href="/en/learn/kernel"
				class="inline-flex max-w-full items-center gap-2 rounded-full border border-line bg-raised py-1 pr-3 pl-1 text-[13px] text-fg-2 hover:border-line-strong hover:text-fg"
			>
				<span class="shrink-0 rounded-full bg-accent-wash px-2 py-0.5 font-mono text-[11px] tracking-normal text-accent">experimental</span>
				A Svelte 5 toolchain written in Rust
				<Icon name="arrow-right" size={13} class="text-muted" />
			</a>
			<h1
				class="mt-7 max-w-[15em] text-[36px] leading-[1.22] font-semibold tracking-[0.005em] sm:text-[clamp(44px,5.4vw,72px)] sm:leading-[1.14]"
				style="font-stretch: 88%"
			>
				The Svelte toolchain,<br class="hidden sm:inline" /> on <span class="text-accent">one kernel</span>
			</h1>
			<div class="mt-8 grid grid-cols-[minmax(0,1fr)] gap-x-16 gap-y-12 lg:grid-cols-12">
				<div class="lg:col-span-6">
					<p class="max-w-[36em] text-[17px] leading-[1.9] text-fg-2 sm:text-[19px]">
						Compiling, formatting, linting, and type checking run on the same parse and the same analysis. Each document is
						parsed once. Syntax that is not ported yet is reported as unsupported, not approximated. The kernel itself counts
						where the time and the memory go.
					</p>
					<div class="mt-9 flex flex-wrap items-center gap-3 text-[15px]">
						<a href="/en/guide" class="inline-flex h-11 items-center gap-2 rounded-md bg-fg px-5 font-medium text-bg shadow-sm hover:bg-accent">Usage guide<Icon name="arrow-right" size={15} /></a>
						<a href="/en/why" class="inline-flex h-11 items-center gap-2 rounded-md border border-line bg-raised px-5 font-medium text-fg hover:border-line-strong">Why we are building rsvelte<Icon name="arrow-right" size={15} /></a>
						<a
							href="/en/learn"
							class="inline-flex h-11 items-center gap-2 rounded-md border border-line bg-raised px-5 font-medium text-fg hover:border-line-strong"
							>Learn the kernel<Icon name="arrow-right" size={15} /></a
						>
						<a
							href="/en/learn/playground"
							class="inline-flex h-11 items-center rounded-md border border-line bg-raised px-5 text-fg hover:border-line-strong"
							>Try the plugins</a
						>
						<a
							href={REPO_URL}
							rel="noopener"
							class="inline-flex h-11 items-center gap-2 rounded-md px-3 text-fg-2 hover:text-fg"
							><Icon name="github" size={17} />GitHub</a
						>
					</div>
					<div
						class="mt-8 flex max-w-[640px] items-center gap-2 rounded-md border border-line bg-sunken py-1.5 pr-1.5 pl-3 font-mono text-[13px]"
					>
						<span class="text-muted select-none" aria-hidden="true">$</span>
						<code class="no-scrollbar min-w-0 flex-1 overflow-x-auto whitespace-nowrap text-fg-2" title={command}>{command}</code>
						<button
							type="button"
							class="flex size-8 shrink-0 items-center justify-center rounded-sm text-muted hover:bg-surface hover:text-fg"
							onclick={copy}
							aria-label={copied ? 'Copied' : 'Copy the command'}
						>
							{#if copied}<Icon name="check" size={15} class="text-ok" />{:else}<Icon name="copy" size={15} />{/if}
						</button>
					</div>
				</div>
				<div class="lg:col-span-6 lg:pt-1">
					<dl class="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line shadow-[0_1px_2px_#0000000a]">
						{#each stats as s (s.label)}
							<div class="flex flex-col bg-bg px-4 py-5 sm:px-6 sm:py-6">
								<dt class="order-2 mt-2 text-[14px] leading-[1.5] text-fg">{s.label}</dt>
								<dd class="order-1 flex items-baseline gap-1 font-mono tracking-tight tnum">
									<span class="text-[32px] leading-none font-medium sm:text-[40px]">{s.value}</span>
									<span class="text-[16px] text-muted sm:text-[18px]">{s.unit}</span>
								</dd>
								<dd class="order-3 mt-1 text-[12.5px] leading-[1.5] text-muted">{s.detail}</dd>
							</div>
						{/each}
					</dl>
					<p class="mt-3 font-mono text-[11.5px] tracking-normal text-muted">
						Measured on release build {data.benchmark.rev.slice(0, 10)}. Chapter <a class="link" href="/en/learn/measure"
							>13</a
						> defines each variant and shows how to run the measurement again.
					</p>
				</div>
			</div>
		</div>
	</section>

	<div class="mx-auto max-w-[1440px] px-4 md:px-8">
		<section class="pt-20" aria-labelledby="hero-fig">
			<div class="grid grid-cols-[minmax(0,1fr)] gap-x-12 gap-y-4 lg:grid-cols-12 lg:items-end">
				<div class="lg:col-span-5">
					<p class="eyebrow">Interactive figure</p>
					<h2 id="hero-fig" class="mt-2 text-[26px] leading-[1.4] font-semibold sm:text-[30px]">From an output position to an input position</h2>
				</div>
				<p class="text-[16px] leading-[1.9] text-fg-2 lg:col-span-7">
					Move the cursor over the <span class="c-gen">output</span>. The figure shows which <span class="c-src">input</span>
					position each character comes from. It uses the same rule as the kernel's
					<code class="text-[14px]">Emitter::lookup</code>: the nearest mapping point at or before the position, on the same line.
				</p>
			</div>
			<div class="mt-8">
				<SpanFigure data={data.counter} label="Figure 0 · From an output position to an input position" />
			</div>
			<p class="mt-3 max-w-[52em] text-[13.5px] leading-[1.8] text-muted">
				The output and its mapping points come from a real compile of <code class="text-[12.5px]">{data.counter.fixture}</code> with
				rsvelte. So far the output has only {data.counter.mappings.length} mapping points. A character without a mapping point takes
				the nearest mapping point before it on the same line.
			</p>
		</section>

		<section class="mt-28 grid grid-cols-[minmax(0,1fr)] gap-x-12 gap-y-8 lg:grid-cols-12" aria-labelledby="one-kernel">
			<div class="lg:col-span-4">
				<p class="eyebrow">Design</p>
				<h2 id="one-kernel" class="mt-2 text-[26px] leading-[1.4] font-semibold sm:text-[30px]">The kernel knows no language</h2>
				<p class="mt-4 text-[16px] leading-[1.9] text-fg-2">
					<code class="text-[14px]">rsvelte_kernel</code> holds positions, names, a cache that computes each result once, the
					scheduler, diagnostics, the layout of formatted code, output with its position mappings, and measurement. It knows
					nothing about Svelte. Svelte is a language plugin. Its core crate registers computed results. Its compile, format,
					lint, and type check crates register tasks and providers of the shared interfaces.
				</p>
				<p class="mt-4 text-[14px] leading-[1.8] text-muted">
					The line counts are taken at build time, so they change with the code without a new drawing. The figure shows only
					the main crates. A dashed line is an indirect dependency through a crate that the figure does not show. Figure 1.2
					in chapter 01, “The kernel at a glance”, gives the role of every crate.
				</p>
				<a href="/en/learn/kernel" class="mt-5 inline-flex items-center gap-1.5 text-[15px] font-medium text-accent hover:underline"
					>01 The kernel at a glance<Icon name="arrow-right" size={14} /></a
				>
			</div>
			<div class="rounded-lg border border-line bg-sunken p-4 sm:p-6 lg:col-span-8">
				<CrateDiagram crates={data.crates} />
			</div>
		</section>

		<section class="mt-28" aria-labelledby="ledger">
			<div class="grid grid-cols-[minmax(0,1fr)] gap-x-12 lg:grid-cols-12">
				<div class="lg:col-span-4">
					<p class="eyebrow">Correctness</p>
					<h2 id="ledger" class="mt-2 text-[26px] leading-[1.4] font-semibold sm:text-[30px]">Agreement with upstream</h2>
					<p class="mt-4 text-[16px] leading-[1.9] text-fg-2">
						We measure correctness against the output of the upstream tools. Almost all hand-written test cases match. In the
						corpus of real components, only part of the compiled output matches upstream, even where rsvelte produces output.
					</p>
				</div>
				<div class="mt-8 min-w-0 lg:col-span-8 lg:mt-0">
					<ul class="flex flex-wrap gap-x-5 gap-y-1 text-[12.5px] text-fg-2">
						{#each VERDICTS as v (v.key)}
							<li class="flex items-center gap-1.5"><span class={['size-2 rounded-full', v.dot]}></span>{v.label}</li>
						{/each}
					</ul>
					<div class="mt-4 overflow-x-auto">
						<table class="table">
							<caption class="mb-2 text-left font-mono text-[12px] tracking-normal text-muted">
								fixtures/_registry/parity.json · {fmt(data.parity.units)} test cases · counted at build time
							</caption>
							<thead><tr><th>Task</th><th class="w-[40%]">Verdicts</th><th class="num">Match</th></tr></thead>
							<tbody>
								{#each data.parity.rows as r (r.task)}
									{@const total = sum(r.verdicts)}
									<tr>
										<td><code>{r.task}</code></td>
										<td>
											<div
												class="flex h-2.5 overflow-hidden rounded-full bg-surface"
												role="img"
												aria-label={VERDICTS.filter((v) => r.verdicts[v.key])
													.map((v) => `${v.label} ${r.verdicts[v.key]}`)
													.join(', ')}
											>
												{#each VERDICTS as v (v.key)}
													{#if r.verdicts[v.key]}
														<span class={v.dot} style:width="{pct(r.verdicts[v.key] ?? 0, total)}%"></span>
													{/if}
												{/each}
											</div>
										</td>
										<td class="num font-mono text-[14px]">{fmt(r.verdicts.match ?? 0)} / {fmt(total)}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
					<p class="mt-3 text-[13px] leading-[1.8] text-muted">
						Each verdict compares a test case with the output of the upstream tools. Some test cases are hand-written; the
						others come from the corpus. Continuous integration treats this file as a baseline and fails when any verdict
						changes (Chapter <a class="link" href="/en/learn/measure">13</a>). “Rejected as unsupported” means that rsvelte
						correctly refused syntax that is not ported yet. “Output that does not parse” is a defect: rsvelte produced
						output where it should have refused.
					</p>
				</div>
			</div>
		</section>

		<section class="mt-28 grid grid-cols-[minmax(0,1fr)] gap-x-12 lg:grid-cols-12" aria-labelledby="performance">
			<div class="lg:col-span-4">
				<p class="eyebrow">Performance</p>
				<h2 id="performance" class="mt-2 text-[26px] leading-[1.4] font-semibold sm:text-[30px]">Measure each mechanism</h2>
				<p class="mt-4 text-[16px] leading-[1.9] text-fg-2">
					Each variant of the benchmark runs the same documents and the same tasks, with one mechanism changed. The
					difference between two variants is the effect of that mechanism. Streaming leaves the time almost unchanged and
					lowers the peak growth of memory in use from {mb(arm('shared').peak)} megabytes to {mb(arm('streaming').peak)} megabytes.
				</p>
				<a href="/en/learn/measure" class="mt-5 inline-flex items-center gap-1.5 text-[15px] font-medium text-accent hover:underline"
					>13 Measurements<Icon name="arrow-right" size={14} /></a
				>
			</div>
			<div class="mt-8 min-w-0 lg:col-span-8 lg:mt-0">
				<div class="overflow-x-auto">
					<table class="table min-w-[560px]">
						<thead>
							<tr><th>Variant</th><th class="w-[42%]">Median</th><th class="num">ms</th><th class="num">Peak growth</th></tr>
						</thead>
						<tbody>
							{#each data.benchmark.arms as a (a.name)}
								<tr>
									<td><code>{a.name}</code><div class="text-[13px] text-muted">{armNote[a.name]}</div></td>
									<td class="align-middle">
										<div class="h-2.5 overflow-hidden rounded-full bg-surface">
											<div
												class={['h-full rounded-full', a.name === 'shared' ? 'bg-accent' : 'bg-line-strong']}
												style:width="{(a.median / maxMs) * 100}%"
											></div>
										</div>
									</td>
									<td class="num">{a.median.toFixed(1)}</td>
									<td class="num">{mb(a.peak)} megabytes</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
				<p class="mt-3 text-[13px] leading-[1.7] text-muted">
					The benchmark ran {data.benchmark.tasks} tasks on {fmt(data.benchmark.documents)} documents
					({mb(data.benchmark.bytes)} megabytes) with {data.benchmark.threads} threads. Each value is the median of
					{data.benchmark.rounds} runs of an optimized build, and the variants ran in alternating order. Time comes from a
					run without the measurement feature, and peak memory from a separate run with it. Build
					{data.benchmark.rev.slice(0, 10)}.
				</p>
			</div>
		</section>

		<section class="mt-28" aria-labelledby="learn">
			<div class="flex flex-wrap items-end justify-between gap-4">
				<div>
					<p class="eyebrow">Learn</p>
					<h2 id="learn" class="mt-2 text-[26px] leading-[1.4] font-semibold sm:text-[30px]">Read the kernel in {chaptersIn('en').length} chapters</h2>
					<p class="mt-3 max-w-[42em] text-[16px] leading-[1.9] text-fg-2">
						A guide that takes you from the overall shape of the kernel down to the details. Every excerpt is cut from the
						real source at build time, and the line numbers are those of the file. Reading all chapters takes about
						{totalMinutes} minutes.
					</p>
				</div>
			</div>
			<div class="mt-10 space-y-10">
				{#each groups as g (g.title)}
					<div>
						<p class="eyebrow mb-3">{g.title}</p>
						<ol class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							{#each g.items as c (c.slug)}
								<li>
									<a
										href={c.href}
										class="group flex h-full flex-col rounded-lg border border-line bg-bg p-4 hover:border-line-strong hover:bg-sunken"
									>
										<span class="flex items-center justify-between font-mono text-[12px] tracking-normal text-muted tnum">
											<span class="rounded-sm bg-surface px-1.5 py-0.5 text-fg-2 group-hover:text-accent">{c.number}</span>
											<span>{c.minutes} minutes</span>
										</span>
										<span class="mt-3 text-[16px] leading-[1.5] font-medium text-fg group-hover:text-accent">{c.title}</span>
										<span class="mt-1.5 text-[13.5px] leading-[1.7] text-muted">{c.abstract}</span>
									</a>
								</li>
							{/each}
						</ol>
					</div>
				{/each}
			</div>
		</section>
	</div>
</main>

<style>
	.hero-grid {
		background-image:
			linear-gradient(to right, var(--border) 1px, transparent 1px),
			linear-gradient(to bottom, var(--border) 1px, transparent 1px);
		background-size: 48px 48px;
		mask-image: radial-gradient(ellipse 70% 80% at 80% 0%, #000 0%, transparent 70%);
		opacity: 0.55;
	}
</style>
