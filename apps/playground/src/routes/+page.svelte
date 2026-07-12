<script lang="ts">
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import type { BenchmarkResults } from '$lib/types/benchmark';
	import type { TestResults } from '$lib/types/test-results';
	import SiteNav from '$lib/components/SiteNav.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import EcoCard from '$lib/components/EcoCard.svelte';
	import Eyebrow from '$lib/components/Eyebrow.svelte';
	import SectionHead from '$lib/components/SectionHead.svelte';
	import { shipped, planned, delegated, counts } from '$lib/ecosystem';

	let bench = $state<BenchmarkResults | null>(null);
	let tests = $state<TestResults | null>(null);
	let animated = $state(false);

	onMount(async () => {
		try {
			const [b, t] = await Promise.all([
				fetch(`${base}/benchmark-results.json`).then((r) => (r.ok ? r.json() : null)),
				fetch(`${base}/test-results.json`).then((r) => (r.ok ? r.json() : null))
			]);
			bench = b;
			tests = t;
		} catch {
			bench = null;
			tests = null;
		}
		requestAnimationFrame(() => (animated = true));
	});

	const formatDuration = (ms: number): string => {
		if (ms < 1) return `${(ms * 1000).toFixed(0)}μs`;
		if (ms < 1000) return `${ms.toFixed(1)} ms`;
		return `${(ms / 1000).toFixed(2)} s`;
	};

	const formatThroughput = (v: number): string => {
		if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
		if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
		return `${Math.round(v)}`;
	};

	const formatDate = (iso: string): string =>
		new Date(iso).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

	// The measured tools across the toolchain — each multi-threaded
	// rsvelte vs. its official JavaScript counterpart on the same corpus.
	const toolchain = $derived.by(() => {
		if (!bench) return [];
		const list = [
			{ label: 'svelte/compiler', sub: 'full pipeline', x: bench.speedup.multiThreadVsJs },
			{ label: 'parser', sub: 'phase 1, isolated', x: bench.parse.speedup.multiThreadVsJs }
		];
		if (bench.svelte2tsx) {
			list.push({ label: 'svelte2tsx', sub: '.svelte → .tsx', x: bench.svelte2tsx.speedup.multiThreadVsJs });
		}
		if (bench.fmt) {
			list.push({ label: 'fmt', sub: 'formatter vs prettier', x: bench.fmt.speedup.multiThreadVsJs });
		}
		if (bench.svelteCheck) {
			list.push({ label: 'svelte-check', sub: 'project type-check', x: bench.svelteCheck.speedup.multiThreadVsJs });
		}
		return list;
	});

	const maxSpeedup = $derived(toolchain.reduce((m, t) => Math.max(m, t.x), 0));

	const compat = $derived.by(() => {
		if (!tests) return null;
		const inScope = tests.summary.total - tests.summary.skipped;
		return {
			passed: tests.summary.passed,
			inScope,
			pct: tests.summary.percentage,
			commit: tests.commit_sha
		};
	});

	// Curated compatibility highlights — counts pulled live from the report.
	const HIGHLIGHTS = [
		{ id: 'runtime-legacy', label: 'runtime / legacy', sub: 'svelte 4 parity' },
		{ id: 'runtime-runes', label: 'runtime / runes', sub: '$state / $derived / $effect' },
		{ id: 'validator', label: 'validator + a11y', sub: 'warnings & errors' },
		{ id: 'css', label: 'css', sub: ':global / scoping / keyframes' },
		{ id: 'hydration', label: 'hydration', sub: 'resume server markup' },
		{ id: 'compiler-errors', label: 'compiler errors', sub: 'parse & semantic checks' }
	];

	const specs = $derived(
		HIGHLIGHTS.map((h) => {
			const cat = tests?.categories.find((c) => c.id === h.id);
			return {
				label: h.label,
				sub: h.sub,
				passed: cat ? cat.passed : null,
				total: cat ? cat.total - cat.skipped : null,
				pct: cat ? cat.percentage : null
			};
		})
	);

	const why = [
		{
			n: '01',
			h: 'Parallel by default.',
			p: 'Files fan out across rayon worker threads. The parser is thread-safe; phase outputs pass directly through without re-parsing.'
		},
		{
			n: '02',
			h: 'Compact memory.',
			p: 'u32 source positions, compact_str on hot paths, AST nodes shaped to keep cache lines warm under real workloads.'
		},
		{
			n: '03',
			h: 'One stack, end to end.',
			p: 'Compiler, svelte2tsx, svelte-check and fmt share the same Rust AST and OXC foundation — no JS hop between the tools in your build.'
		}
	];
</script>

<svelte:head>
	<title>rsvelte · the Svelte ecosystem, in Rust</title>
	<meta
		name="description"
		content="A Rust port of the Svelte ecosystem — compiler, svelte2tsx, svelte-check, fmt and vite-plugin-svelte as drop-in replacements. Same surface, identical output, up to 114× faster."
	/>
</svelte:head>

<div class="page" class:in={animated}>
	<SiteNav active="home" />

	<header class="hero">
		<img class="hero-logo" src="{base}/logo.png" alt="rsvelte" width="96" height="96" />

		<Eyebrow marginBottom="1.6rem">Svelte ecosystem · written in Rust</Eyebrow>

		<h1 class="title">
			The Svelte ecosystem,<br />rewritten in <span class="ink-rust">Rust</span>.
		</h1>

		<p class="lede">
			Drop-in replacements for the tools you already run — the compiler, <code>svelte2tsx</code>,
			<code>svelte-check</code>, <code>fmt</code>, the Vite plugin. Same surface, identical output, up to
			<span class="ink-svelte">{bench ? Math.round(maxSpeedup) : 114}×</span> faster.
		</p>

		<div class="cta">
			<a href="#ecosystem" class="btn btn-primary">
				Explore the ecosystem <span aria-hidden="true">↓</span>
			</a>
			<a href="{base}/playground" class="btn btn-ghost">
				Open playground <span aria-hidden="true">→</span>
			</a>
		</div>

		<p class="install">
			<span class="prompt">$</span> pnpm add <span class="pkg">@rsvelte/compiler</span>
		</p>
	</header>

	<section class="perf" id="performance">
		<SectionHead num="01">
			Fast across the <em>whole</em> toolchain.
			{#snippet lede()}
				<p class="lede">
					Speed is the point. Every tool is benchmarked against its official
					<code>svelte/*</code> counterpart — same machine, same corpus, full pipeline: parse,
					analyze, codegen.
				</p>
			{/snippet}
		</SectionHead>

		<div class="perf-grid">
			<figure class="bars">
				<figcaption>
					<span class="bars-title">Compile · full pipeline</span>
					<span class="bars-sub"
						>{bench ? `${bench.testFilesCount.toLocaleString('en-US')} .svelte files` : '—'}</span
					>
				</figcaption>

				{#if bench}
					{@const max = Math.max(
						bench.javascript.durationMs,
						bench.rustSingleThread.durationMs,
						bench.rustMultiThread.durationMs
					)}
					{@const rows = [
						{ k: 'svelte/compiler', tone: 'js', sub: 'JavaScript', dur: bench.javascript.durationMs },
						{ k: 'rsvelte / single', tone: 'rs', sub: 'no parallelism', dur: bench.rustSingleThread.durationMs },
						{ k: 'rsvelte / multi', tone: 'rm', sub: 'rayon fan-out', dur: bench.rustMultiThread.durationMs }
					]}
					<div class="bar-list">
						{#each rows as r, i (r.k)}
							<div class="bar-row" style="--i: {i};">
								<div class="bar-meta">
									<span class="bar-k">{r.k}</span>
									<span class="bar-s">{r.sub}</span>
								</div>
								<div class="bar-graph">
									<span class="bar-track">
										<span class="bar-fill bar-{r.tone}" style="--w: {(r.dur / max) * 100}%;"></span>
									</span>
									<span class="bar-t">{formatDuration(r.dur)}</span>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="bars-empty">
						<p>Benchmark data not loaded.</p>
					</div>
				{/if}

				<div class="bars-foot">
					<span>Lower is better</span>
					<span class="dot-sep">·</span>
					<span>{bench ? `recorded ${formatDate(bench.generatedAt)}` : ''}</span>
					{#if bench}
						<span class="dot-sep">·</span>
						<span><code>{bench.commitSha}</code></span>
					{/if}
				</div>
			</figure>

			<aside class="toolchain">
				<p class="toolchain-k">Multi-threaded vs. official JS</p>
				{#if toolchain.length}
					<ul class="toolchain-list">
						{#each toolchain as t (t.label)}
							<li class="toolchain-row">
								<span class="tc-meta">
									<span class="tc-name">{t.label}</span>
									<span class="tc-sub">{t.sub}</span>
								</span>
								<span class="tc-x">{t.x.toFixed(t.x >= 50 ? 0 : 1)}<span class="x">×</span></span>
							</li>
						{/each}
					</ul>
				{:else}
					<p class="toolchain-empty">—</p>
				{/if}
				<a class="toolchain-link" href="{base}/benchmark">
					Full breakdown <span aria-hidden="true">→</span>
				</a>
			</aside>
		</div>
	</section>

	<section class="eco" id="ecosystem">
		<SectionHead num="02">
			Not just a <em>compiler</em>.
			{#snippet lede()}
				<p class="lede">
					rsvelte ports the hot path of every common Svelte workflow. {counts.shipped} drop-in
					packages ship today — each a byte-for-byte replacement for its upstream tool — with
					{counts.planned} more planned and {counts.delegated} deliberately delegated to the wider
					<a class="link" href="https://oxc.rs/" target="_blank" rel="noopener">OXC</a> toolchain.
				</p>
			{/snippet}
		</SectionHead>

		<h3 class="eco-tier">Shipped <span class="eco-tier-n">· usable today</span></h3>
		<div class="eco-grid">
			{#each shipped as c (c.name)}
				<EcoCard {c} compact />
			{/each}
		</div>

		{#if planned.length > 0}
			<h3 class="eco-tier">Planned <span class="eco-tier-n">· on the roadmap</span></h3>
			<div class="eco-grid">
				{#each planned as c (c.name)}
					<EcoCard {c} compact />
				{/each}
			</div>
		{/if}

		{#if delegated.length > 0}
			<h3 class="eco-tier">Delegated <span class="eco-tier-n">· routed to OXC / JS</span></h3>
			<div class="eco-grid">
				{#each delegated as c (c.name)}
					<EcoCard {c} compact />
				{/each}
			</div>
		{/if}
	</section>

	<section class="dropin">
		<SectionHead num="03">
			One import. <em>No flags.</em>
			{#snippet lede()}
				<p class="lede">
					No bundler plugin to rewrite, no compiler flag to flip. The same
					<code>compile()</code>, <code>parse()</code>, <code>preprocess()</code> — or swap the Vite
					plugin and leave your <code>vite.config.js</code> untouched.
				</p>
			{/snippet}
		</SectionHead>

		<figure class="diff">
			<figcaption>
				<span class="diff-file">build.config.js</span>
			</figcaption>
			<pre><code><span class="d-line d-minus"><span class="d-sig">-</span> import * as svelte from <span class="d-str">'svelte/compiler'</span>;</span>
<span class="d-line d-plus"><span class="d-sig">+</span> import * as svelte from <span class="d-str">'@rsvelte/compiler'</span>;</span></code></pre>
		</figure>
	</section>

	<section class="compat">
		<SectionHead num="04">
			Verified against the <em>official</em> suite.
			{#snippet lede()}
				<p class="lede">
					{#if compat}
						<span class="big-pct">{compat.passed.toLocaleString('en-US')} / {compat.inScope.toLocaleString('en-US')}</span>
						in-scope fixtures from <code>sveltejs/svelte</code> — {compat.pct.toFixed(1)}%. Full
						breakdown on the <a class="link" href="{base}/progress">compatibility page</a>.
					{:else}
						Every category of the official <code>sveltejs/svelte</code> suite, run locally. Full
						breakdown on the <a class="link" href="{base}/progress">compatibility page</a>.
					{/if}
				</p>
			{/snippet}
		</SectionHead>

		<dl class="spec-list">
			{#each specs as s, i (s.label)}
				<div class="spec-row" style="--i: {i};">
					<dt class="spec-k">{s.label}</dt>
					<dd class="spec-v">
						<span class="spec-n"
							>{s.passed !== null ? s.passed.toLocaleString('en-US') : '—'}<span class="spec-n-sep"
								>/</span
							><span class="spec-n-tot">{s.total !== null ? s.total.toLocaleString('en-US') : '—'}</span></span
						>
						<span class="spec-s">{s.sub}</span>
						<span class="spec-pct"
							>{s.pct !== null ? Math.round(s.pct) : '—'}<span class="dim">%</span></span
						>
					</dd>
				</div>
			{/each}
		</dl>
	</section>

	<section class="capi">
		<SectionHead num="05">
			Not just <em>Node.js</em>.
			{#snippet lede()}
				<p class="lede">
					A stable C ABI ships alongside the NAPI build — one shared library, one header, UTF-8
					JSON in/out. Drive the same compiler from any language with a C FFI.
				</p>
			{/snippet}
		</SectionHead>

		<ul class="capi-langs">
			<li><span class="capi-tag">C / C++</span><span>include <code>rsvelte.h</code></span></li>
			<li><span class="capi-tag">Go</span><span>cgo</span></li>
			<li><span class="capi-tag">Python</span><span>ctypes / cffi</span></li>
			<li><span class="capi-tag">Ruby</span><span>stdlib <code>fiddle</code></span></li>
			<li><span class="capi-tag">PHP</span><span>built-in <code>FFI</code> (7.4+)</span></li>
			<li><span class="capi-tag">Zig</span><span><code>@cImport</code></span></li>
			<li><span class="capi-tag">Java / Kotlin</span><span>FFM API (JDK 22+)</span></li>
			<li><span class="capi-tag">.NET</span><span><code>LibraryImport</code></span></li>
		</ul>

		<p class="capi-foot">
			Smoke-tested in CI across Linux, macOS and Windows. See the
			<a class="link" href="https://github.com/baseballyama/rsvelte/tree/main/crates/rsvelte_capi"
				><code>crates/rsvelte_capi</code></a
			> for the full API and per-language quick start.
		</p>
	</section>

	<section class="why">
		<SectionHead num="06">Why it's fast.</SectionHead>

		<div class="why-list">
			{#each why as w (w.h)}
				<article class="why-row">
					<span class="why-n">{w.n}</span>
					<div class="why-body">
						<h3>{w.h}</h3>
						<p>{w.p}</p>
					</div>
				</article>
			{/each}
		</div>
	</section>

	<SiteFooter />
</div>

<style>
	.page {
		min-height: 100vh;
	}

	code,
	pre {
		font-family: 'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace;
	}

	/* HERO */
	.hero {
		max-width: 1080px;
		margin: 0 auto;
		padding: clamp(4rem, 12vh, 7rem) clamp(1rem, 4vw, 2.5rem) clamp(3rem, 6vh, 4.5rem);
	}

	.hero-logo {
		display: block;
		width: clamp(72px, 9vw, 96px);
		height: auto;
		margin: 0 0 1.8rem;
		border-radius: 16px;
	}

	.title {
		font-family: 'Hanken Grotesk', sans-serif;
		font-weight: 800;
		font-size: clamp(2.3rem, 6.2vw, 4.6rem);
		line-height: 1.02;
		letter-spacing: -0.03em;
		color: var(--ink);
		margin: 0;
	}

	.ink-rust {
		color: var(--rust);
		font-style: italic;
		font-weight: 700;
	}

	.ink-svelte {
		color: var(--svelte);
	}

	.lede {
		font-size: clamp(1.05rem, 1.3vw, 1.2rem);
		max-width: 54ch;
		color: var(--ink-soft);
		margin: 1.6rem 0 0;
	}

	.lede code {
		background: var(--paper);
		color: var(--ink);
		padding: 0.08em 0.4em;
		border-radius: 3px;
		font-size: 0.88em;
		border: 1px solid var(--rule);
	}

	.cta {
		display: flex;
		gap: 0.65rem;
		flex-wrap: wrap;
		margin-top: 2.4rem;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.78rem 1.25rem;
		font-family: 'Hanken Grotesk', sans-serif;
		font-weight: 600;
		font-size: 0.95rem;
		border-radius: 4px;
		border: 1px solid transparent;
		transition:
			background 0.18s,
			color 0.18s,
			border-color 0.18s;
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
		background: var(--svelte-hover);
	}

	.btn-ghost {
		background: transparent;
		color: var(--ink);
		border-color: var(--rule-strong);
	}

	.btn-ghost:hover {
		border-color: var(--ink);
	}

	.install {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.9rem;
		color: var(--ink-soft);
		margin-top: 2.2rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--rule);
		max-width: 36rem;
	}

	.install .prompt {
		color: var(--svelte);
		margin-right: 0.6em;
	}

	.install .pkg {
		color: var(--rust);
	}

	/* PERF */
	.perf {
		background: var(--paper);
		border-block: 1px solid var(--rule);
	}

	.compat .lede code,
	.perf .lede code {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.78em;
		font-weight: 500;
		padding: 0.1em 0.45em;
		background: var(--bg);
		border: 1px solid var(--rule);
		border-radius: 3px;
		vertical-align: 0.05em;
	}

	.perf-grid {
		max-width: 1080px;
		margin: 0 auto;
		padding: 0 clamp(1rem, 4vw, 2.5rem) clamp(4rem, 8vh, 6rem);
		display: grid;
		grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
		gap: clamp(1.5rem, 3vw, 2.5rem);
		align-items: start;
	}

	.bars {
		background: var(--bg);
		border: 1px solid var(--rule);
		border-radius: 6px;
		overflow: hidden;
	}

	.bars figcaption {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		padding: 0.9rem 1.25rem;
		border-bottom: 1px solid var(--rule);
	}

	.bars-title {
		font-weight: 600;
		font-size: 0.92rem;
		color: var(--ink);
	}

	.bars-sub {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.72rem;
		color: var(--ink-soft);
	}

	.bar-list {
		padding: 1.2rem 1.25rem 0.4rem;
		display: flex;
		flex-direction: column;
		gap: 1.05rem;
	}

	.bar-row {
		display: grid;
		grid-template-columns: minmax(10rem, 11rem) 1fr;
		gap: 1.2rem;
		align-items: center;
	}

	.bar-meta {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		min-width: 0;
	}

	.bar-k {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.78rem;
		font-weight: 500;
		color: var(--ink);
		letter-spacing: -0.01em;
	}

	.bar-s {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.66rem;
		color: var(--ink-faint);
		letter-spacing: 0.02em;
	}

	.bar-graph {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		gap: 0.85rem;
	}

	.bar-track {
		display: block;
		height: 10px;
		background: var(--paper);
		border: 1px solid var(--rule);
		border-radius: 999px;
		overflow: hidden;
	}

	.bar-fill {
		display: block;
		height: 100%;
		width: 0;
		border-radius: inherit;
		transition: width 0.9s cubic-bezier(0.22, 1, 0.36, 1);
		transition-delay: calc(0.12s * var(--i, 0) + 0.15s);
	}

	.page.in .bar-fill {
		width: var(--w);
	}

	.bar-js {
		background: linear-gradient(
			90deg,
			color-mix(in srgb, var(--ink-faint) 70%, transparent),
			var(--ink-faint)
		);
	}

	.bar-rs {
		background: linear-gradient(90deg, var(--rust-soft), var(--rust));
	}

	.bar-rm {
		background: linear-gradient(90deg, var(--rust-soft), var(--svelte));
	}

	.bar-t {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.82rem;
		color: var(--ink);
		font-variant-numeric: tabular-nums;
		min-width: 5.5rem;
		text-align: right;
	}

	.bars-foot {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		flex-wrap: wrap;
		padding: 0.85rem 1.25rem 1rem;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.7rem;
		color: var(--ink-faint);
		border-top: 1px solid var(--rule);
		margin-top: 0.6rem;
	}

	.bars-foot code {
		color: var(--ink-soft);
	}

	.dot-sep {
		opacity: 0.5;
	}

	.bars-empty {
		padding: 2rem 1.25rem;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.85rem;
		color: var(--ink-faint);
	}

	/* TOOLCHAIN SPEEDUP LIST */
	.toolchain {
		background: var(--bg);
		border: 1px solid var(--rule);
		border-radius: 6px;
		padding: 1.1rem 1.25rem 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.toolchain-k {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.66rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink-faint);
		margin: 0 0 0.5rem;
	}

	.toolchain-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.toolchain-row {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.7rem 0;
		border-bottom: 1px solid var(--rule);
	}

	.toolchain-row:first-child {
		border-top: 1px solid var(--rule);
	}

	.tc-meta {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		min-width: 0;
	}

	.tc-name {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.8rem;
		color: var(--ink);
	}

	.tc-sub {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.66rem;
		color: var(--ink-faint);
	}

	.tc-x {
		font-family: 'Hanken Grotesk', sans-serif;
		font-weight: 800;
		font-size: 1.45rem;
		line-height: 1;
		letter-spacing: -0.03em;
		color: var(--svelte);
		font-variant-numeric: tabular-nums;
	}

	.tc-x .x {
		font-family: 'JetBrains Mono', monospace;
		font-weight: 500;
		font-size: 0.42em;
		margin-left: 0.1em;
		color: var(--svelte);
		opacity: 0.7;
	}

	.toolchain-empty {
		font-family: 'JetBrains Mono', monospace;
		color: var(--ink-faint);
		padding: 1rem 0;
	}

	.toolchain-link {
		margin-top: 0.9rem;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.78rem;
		color: var(--ink-soft);
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		transition: color 0.18s;
	}

	.toolchain-link span {
		transition: transform 0.18s;
	}

	.toolchain-link:hover {
		color: var(--svelte);
	}

	.toolchain-link:hover span {
		transform: translateX(3px);
	}

	/* ECOSYSTEM */
	.eco {
		max-width: 1080px;
		margin: 0 auto;
		/* Bottom breathing room (previously provided by the removed `.eco-foot`). */
		padding-bottom: clamp(2rem, 4vh, 3rem);
		/* Anchor target from the hero CTA — offset so the heading isn't hidden
		   under the sticky nav. */
		scroll-margin-top: 5rem;
	}

	.eco-grid {
		max-width: 1080px;
		margin: 0 auto;
		padding: 0 clamp(1rem, 4vw, 2.5rem);
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 1rem;
	}

	/* Sub-group heading inside the ecosystem section (Shipped / Planned /
	   Delegated). */
	.eco-tier {
		max-width: 1080px;
		margin: 1.8rem auto 0.8rem;
		padding: 0 clamp(1rem, 4vw, 2.5rem);
		font-family: 'Hanken Grotesk', sans-serif;
		font-weight: 700;
		font-size: 0.95rem;
		letter-spacing: -0.01em;
		color: var(--ink);
	}

	.eco-tier:first-of-type {
		margin-top: 0;
	}

	.eco-tier-n {
		font-weight: 500;
		color: var(--ink-faint);
	}

	/* DROP-IN */
	.dropin {
		max-width: 1080px;
		margin: 0 auto;
	}

	.diff {
		max-width: 680px;
		margin: 0 auto clamp(2.5rem, 6vh, 4rem);
		background: var(--paper);
		border: 1px solid var(--rule);
		border-radius: 6px;
		font-family: 'JetBrains Mono', monospace;
		overflow: hidden;
	}

	.diff figcaption {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.65rem 1rem;
		border-bottom: 1px solid var(--rule);
		font-size: 0.72rem;
		letter-spacing: 0.04em;
		color: var(--ink-faint);
	}

	.diff-file {
		color: var(--ink-soft);
	}

	.diff pre {
		margin: 0;
		padding: 0.9rem 1.15rem;
		font-size: 0.88rem;
		line-height: 1.75;
	}

	.d-line {
		display: block;
		padding: 0.1rem 0;
	}

	.d-sig {
		display: inline-block;
		width: 1.2em;
		opacity: 0.65;
	}

	.d-minus {
		color: var(--bad);
	}

	.d-plus {
		color: var(--ok);
		background: color-mix(in srgb, var(--ok) 8%, transparent);
	}

	.d-str {
		color: var(--rust);
	}

	/* CAPI (Beyond Node.js) */
	.capi {
		max-width: 1080px;
		margin: 0 auto clamp(4rem, 10vh, 7rem);
		padding: 0 clamp(1rem, 4vw, 2.5rem);
	}

	.capi-langs {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 0.6rem 1.5rem;
		list-style: none;
		padding: 0;
		margin: 0 auto clamp(1.5rem, 3vh, 2rem);
		max-width: 880px;
		font-size: 0.92rem;
		color: var(--ink-soft);
	}

	.capi-langs li {
		display: flex;
		align-items: baseline;
		gap: 0.65rem;
		padding: 0.55rem 0;
		border-bottom: 1px solid var(--rule);
	}

	.capi-tag {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.78rem;
		letter-spacing: 0.02em;
		color: var(--ink);
		min-width: 7rem;
		font-weight: 600;
	}

	.capi-langs code {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.85em;
		color: var(--ink);
	}

	.capi-foot {
		text-align: center;
		font-size: 0.88rem;
		color: var(--ink-faint);
		max-width: 720px;
		margin: 0 auto;
	}

	/* COMPAT */
	.compat {
		max-width: 1080px;
		margin: 0 auto;
	}

	.big-pct {
		font-family: 'Hanken Grotesk', sans-serif;
		font-weight: 800;
		color: var(--ink);
		letter-spacing: -0.01em;
	}

	.spec-list {
		max-width: 1080px;
		margin: 0 auto clamp(2.5rem, 5vh, 3.5rem);
		padding: 0 clamp(1rem, 4vw, 2.5rem);
	}

	.spec-row {
		display: grid;
		grid-template-columns: minmax(10rem, 14rem) 1fr;
		gap: 1.4rem;
		align-items: baseline;
		padding: 1rem 0;
		border-bottom: 1px solid var(--rule);
		opacity: 0;
		transform: translateY(6px);
		transition:
			opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1),
			transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
		transition-delay: calc(0.05s * var(--i, 0));
	}

	.page.in .spec-row {
		opacity: 1;
		transform: none;
	}

	.spec-row:first-child {
		border-top: 1px solid var(--rule);
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
		margin: 0;
		min-width: 0;
	}

	/* The percentage is the last child of the value <dd>; push it to the row's
	   right edge so the layout matches the old 3-column grid. */
	.spec-pct {
		margin-left: auto;
		padding-left: 0.85rem;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.82rem;
		color: var(--ink);
		font-variant-numeric: tabular-nums;
	}

	.spec-n {
		font-family: 'Hanken Grotesk', sans-serif;
		font-weight: 700;
		font-size: 1.15rem;
		color: var(--ink);
		font-variant-numeric: tabular-nums;
		letter-spacing: -0.015em;
	}

	.spec-n-sep {
		color: var(--ink-faint);
		margin: 0 0.18em;
	}

	.spec-n-tot {
		color: var(--ink-soft);
		font-size: 0.82em;
	}

	.spec-s {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.74rem;
		color: var(--ink-soft);
	}

	.spec-pct .dim {
		color: var(--ink-faint);
	}

	.link {
		color: var(--svelte);
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 3px;
	}

	.link:hover {
		color: var(--svelte-hover);
	}

	/* WHY */
	.why {
		max-width: 1080px;
		margin: 0 auto;
	}

	.why-list {
		max-width: 1080px;
		margin: 0 auto;
		padding: 0 clamp(1rem, 4vw, 2.5rem) clamp(4rem, 8vh, 6rem);
		display: grid;
		gap: 0;
	}

	.why-row {
		display: grid;
		grid-template-columns: minmax(2.5rem, 4rem) 1fr;
		gap: 1.5rem;
		padding: 1.6rem 0;
		border-bottom: 1px solid var(--rule);
		align-items: start;
	}

	.why-row:first-child {
		border-top: 1px solid var(--rule);
	}

	.why-n {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.72rem;
		letter-spacing: 0.16em;
		color: var(--rust);
	}

	.why-body h3 {
		font-family: 'Hanken Grotesk', sans-serif;
		font-weight: 700;
		font-size: 1.18rem;
		letter-spacing: -0.015em;
		color: var(--ink);
		margin: 0 0 0.45rem;
	}

	.why-body p {
		font-size: 0.97rem;
		color: var(--ink-soft);
		margin: 0;
		max-width: 64ch;
	}

	/* RESPONSIVE */
	@media (max-width: 880px) {
		.perf-grid {
			grid-template-columns: 1fr;
		}
		.spec-row {
			grid-template-columns: 1fr;
			gap: 0.4rem 1rem;
		}
	}

	@media (max-width: 640px) {
		.bar-row {
			grid-template-columns: 1fr;
			gap: 0.5rem;
		}
		.bar-meta {
			flex-direction: row;
			align-items: baseline;
			gap: 0.6rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.bar-fill,
		.spec-row,
		.btn span {
			transition: none !important;
		}
		.spec-row {
			opacity: 1 !important;
			transform: none !important;
		}
		.page.in .bar-fill {
			width: var(--w);
			transition: none !important;
		}
	}
</style>
