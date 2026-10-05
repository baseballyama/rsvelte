<script lang="ts">
	import Term from '$lib/components/Term.svelte';
	import ChapterFooter from '$lib/components/ChapterFooter.svelte';
	import ChapterHeader from '$lib/components/ChapterHeader.svelte';
	import Code from '$lib/components/Code.svelte';
	import DeepDive from '$lib/components/DeepDive.svelte';
	import H2 from '$lib/components/H2.svelte';
	import Note from '$lib/components/Note.svelte';
	import { chapter } from '$lib/site';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const c = chapter('measure', 'en');
	const workingTree = 'Working tree (not committed)';
	const fmt = (n: number) => n.toLocaleString('en-US');
	const mb = (b: number) => (b / 1e6).toFixed(1);
	const a = (name: string) => {
		const x = data.arms.find((y) => y.name === name);
		if (!x) throw new Error(`no arm ${name}`);
		return x;
	};
	const armDoc: Record<string, string> = {
		shared: 'Tasks for a document share computed results, pool on, all threads',
		isolated: 'Each task computes its results again',
		nopool: 'No pool',
		serial: '1 thread',
		streaming: 'Like shared, and drops each result as soon as it is final'
	};
	const totalSelf = $derived(data.phases.reduce((n, p) => n + p.self_ms, 0));
	const maxMs = $derived(Math.max(...data.arms.map((x) => x.plain[0])));
	const verdicts = ['match', 'mismatch', 'unparseable', 'unexpected', 'missing'];
	const perByte = (n: number) => (n / data.performance.population.source_bytes).toFixed(1);
</script>

<svelte:head><title>{c.title} — rsvelte Learn</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="Measuring performance once is not enough. On each push to main and experimental, and on each pull request, rsvelte runs a check that counts only quantities that machine load does not change, and compares them with recorded values. This chapter shows how that check works, and where the timing benchmarks in the other chapters come from."
/>

<div class="prose-learn">
	<H2 id="ratchet" />
	<p>
		A <dfn>check against the performance baseline</dfn> finds changes from the recorded values. It processes the test source
		collection and measures the number of memory allocations, the allocated bytes, and the instruction count. Then it compares
		them with <code>tools/performance/baseline.json</code>. If a value increased, the automatic check fails. If a value
		decreased but the baseline was not updated, the check also fails. A change that improves a value updates the baseline in
		the same commit, and later runs use the new value.
	</p>
	<p>The numbers below are read from <code>tools/performance/baseline.json</code> when this page was built.</p>
</div>

<figure class="my-8 overflow-x-auto">
	<table class="table [&_td:first-child]:pr-6 [&_td:first-child]:whitespace-nowrap">
		<tbody>
			<tr><td>Population</td><td class="num">{fmt(data.performance.population.documents)} documents, {fmt(data.performance.population.source_bytes)} bytes</td></tr>
			<tr><td>Tasks</td><td class="font-mono text-[13px]">{data.performance.population.tasks.join(', ')}</td></tr>
			<tr><td>Allocations (last 1 round)</td><td class="num">{fmt(data.performance.allocations)}</td></tr>
			<tr><td>Allocated bytes</td><td class="num">{fmt(data.performance.allocBytes)}</td></tr>
			<tr><td>Peak growth of memory in use</td><td class="num">{fmt(data.performance.peak)}</td></tr>
			<tr
				><td>Instructions, 1 round ({data.performance.platform})</td><td class="num"
					>{fmt(data.performance.instructions)} ({perByte(data.performance.instructions)} for each 1 byte of input)</td
				></tr
			>
			<tr
				><td>Instructions, loading ({data.performance.platform})</td><td class="num"
					>{fmt(data.performance.load)} ({perByte(data.performance.load)} for each 1 byte of input)</td
				></tr
			>
		</tbody>
	</table>
	<figcaption class="mt-2 text-[13px] leading-[1.7] text-muted">
		Last change to this baseline: {#if data.performance.last.sha === null}{workingTree}{:else}<code>{data.performance.last.sha}</code> (<span
				lang="en">{data.performance.last.subject}</span
			>){/if}. The history of the recorded values is in Chapter <a class="link" href="/en/learn/polish#history">14</a>.
	</figcaption>
</figure>

<div class="prose-learn">
	<H2 id="counters" />
	<p>The check counts three kinds of quantities.</p>
	<ul>
		<li>
			Allocations: in a build with the <code>metrics</code> feature, <code>rsvelte performance</code> counts the allocations
			and bytes of the last round with <Term name="CountingAllocator" /> (Chapter <a href="/en/learn/kernel/measurement#alloc"
				>11</a
			>). It records the totals, the calls, allocations, and bytes of each phase (computed result, task, or rule), and the
			peak growth of memory in use. The comparison is an <strong>exact match</strong>.
		</li>
		<li>
			Instructions (1 round): cachegrind (Valgrind) runs the shipped build without metrics and counts the executed
			instructions (<code>I references</code>). The count of a <code>rounds=1</code> run is subtracted from the count of a
			<code>rounds=2</code> run, so the result is exactly 1 warm round. The comparison allows <strong>±0.2%</strong>.
		</li>
		<li>
			Instructions (loading): a <code>rounds=0</code> run, which covers start-up, the directory walk, reading the files, and
			building the documents. Every run of the command line program pays this cost, so it is counted separately. The
			comparison also allows ±0.2%.
		</li>
	</ul>
</div>

<Code item={data.code.perfDoc} />

<figure class="my-8 overflow-x-auto xl:mr-[calc(-232px-48px)]">
	<table class="table min-w-[560px]">
		<thead><tr><th>Phase</th><th class="num">Calls</th><th class="num">Allocations</th><th class="num">Bytes</th></tr></thead>
		<tbody>
			{#each data.performance.phases as p (p.name)}
				<tr>
					<td><code>{p.name}</code></td>
					<td class="num">{fmt(p.calls)}</td>
					<td class="num">{fmt(p.allocations)}</td>
					<td class="num">{fmt(p.alloc_bytes)}</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<figcaption class="mt-2 text-[13px] leading-[1.7] text-muted">
		The phase table of the baseline, with the most allocations first. Allocations are self counts (without nested phases).
	</figcaption>
</figure>

<div class="prose-learn">
	<H2 id="determinism" />
	<p>
		The check can compare values exactly because we chose a way to measure in which the counts depend only on the input and the
		binary.
	</p>
	<ul>
		<li>
			<strong>Run on 1 thread.</strong> In a parallel run, which document gets which thread's buffer pool changes from run to
			run, and so does the allocation count. On 1 thread, the sequence of allocations is a function of the input and the binary.
			In the commit that added the check, 2 measurements of the committed test source collection matched byte for byte
			(fa4072dfa3).
		</li>
		<li>
			<strong>Count only the last round.</strong> In the first round, the buffer pool is empty, so allocations that grow
			capacity get mixed in. The check counts the last round, when the pool is warm.
		</li>
		<li>
			<strong>Remove allocations that depend on the platform.</strong> When <code>run</code> used a <code>Mutex</code> for each
			document, the macOS lock code allocated memory on first use. For this reason, the allocation counts on macOS and Linux
			differed by the number of documents. Since the lock was removed, the two platforms report the same numbers (a5f67528cd,
			Chapter <a href="/en/learn/kernel/pipeline#run">06</a>).
		</li>
		<li>
			<strong>Do not depend on the file system order.</strong> When the command line program loads files, it visits the entries
			of each directory in name order, depth first. On every file system, the documents come in the same order (a5822ee26f).
		</li>
		<li>
			<strong>Count instructions, not time.</strong> On the same machine, the instruction count also repeats almost exactly. 2
			measurements of the same tree differed by about 1e-7 (a5f67528cd). The ±0.2% tolerance absorbs differences in how libc
			and each processor choose between function variants.
		</li>
	</ul>
	<p>
		Instruction counts are compared only on the platform where the baseline was recorded (now arm64 Linux). Allocations are the
		same on every platform, so you can also compare them on your own macOS machine with <code>mise run performance</code>. In a
		run that does not count instructions, that field shows <code>UNMEASURED</code>, never 0.
	</p>

	<H2 id="ci" />
	<p>
		<code>.github/workflows/ci.yml</code> runs four jobs on each push to main and experimental, and on each pull request:
	</p>
	<ul>
		<li><code>rust</code>: formatting, clippy with two feature combinations, rustdoc, and tests.</li>
		<li>
			<code>fixtures</code>: runs every task on every test input and compares the results with the expected output of the
			official tools (the check against the correctness baseline in the next section).
		</li>
		<li><code>site</code>: the tests, type check, and build of this site.</li>
		<li>
			<code>performance</code>: measures instruction counts on Ubuntu with a 64-bit Arm processor. It uses Valgrind to
			measure. Command:<br />
			<code>node tools/performance/bin/performance.ts --instructions --json performance-report.json</code>. The job saves the
			report as an artifact.
		</li>
	</ul>
	<p>
		A change that moves the counts on purpose updates the baseline in the same commit. Update allocations with
		<code>mise run performance:update</code>. Instruction counts are measured on Linux with a 64-bit Arm processor.
		<code>tools/performance/linux.sh --update</code> measures in the same Docker environment as the automatic check, and writes
		the result back as the baseline.
	</p>
	<p>
		<code>linux.sh</code> measures a snapshot of the staged sources and of the test inputs and expected outputs, not the working
		tree. In this way it measures what goes into the next commit, in the same form as the clean checkout of the automatic check.
		Before, only the test inputs and expected outputs came from the working tree. So the loading walk also counted the
		<code>actual/</code> folders that local runs left next to each test case. As a result, loading measured 345,677,577
		instructions locally and 292,546,145 on the clean checkout of the automatic check. A run of the check from a clean worktree
		found this (201b86fd6b).
	</p>
	<DeepDive title="How we confirm that the check really checks">
		<p>
			When we added the check, we made performance worse on purpose and confirmed that the check failed. Each call of the
			button check rule allocated one extra array with room for one element. The allocation count went from 973 to 6,405, and
			the check failed. The increase of 5,432 equals the number of calls of the rule. After we reverted the change, all 93
			counts returned to their earlier values (fa4072dfa3).
		</p>
		<p>
			We also tested the output comparison with a change made on purpose. When we added one character to the end of the
			formatted output of one test case, the check reported a change from match to mismatch and failed (893f2cf1c7).
		</p>
	</DeepDive>

	<H2 id="parity" />
	<p>
		The checks compare the output too, not only performance. <code>fixtures check</code> gives a verdict for each task, output
		kind, and test case. If a case has several artifacts, it takes the worst verdict. It compares the verdicts with
		<code>fixtures/_registry/parity.json</code> and finds both improvements and regressions. There is no limit on the number of
		checked cases. The table below counts the entries of <code>parity.json</code> when this page was built.
	</p>
</div>

<figure class="my-8 overflow-x-auto xl:mr-[calc(-232px-48px)]">
	<table class="table min-w-[640px]">
		<thead>
			<tr><th>Task</th>{#each verdicts as v (v)}<th class="num">{v}</th>{/each}</tr>
		</thead>
		<tbody>
			{#each data.parity.rows as r (r.task)}
				<tr>
					<td><code>{r.task}</code></td>
					{#each verdicts as v (v)}<td class="num">{r.verdicts[v] ? fmt(r.verdicts[v]) : ''}</td>{/each}
				</tr>
			{/each}
		</tbody>
	</table>
	<figcaption class="mt-2 text-[13px] leading-[1.7] text-muted">
		{fmt(data.parity.units)} cases. Test cases that rsvelte refused as not supported are not in the table.
	</figcaption>
</figure>

<div class="prose-learn">
	<p>
		Because refused test cases are not listed, a test case that becomes refused shows up as an entry that disappeared from the
		table. <code>unparseable</code> marks a test case where rsvelte wrote output that cannot be parsed as JavaScript; rsvelte
		should have refused that case.
	</p>

	<H2 id="arms" />
	<p>
		From here on, this chapter shows the timing results that the other chapters mention. It compares five configurations.
		Each one processes the same {fmt(data.population.documents)} documents ({mb(data.population.bytes)} megabytes). The work is
		compiling for the client and the server, formatting, and linting<Note
			>Type checking starts the external <code>tsc</code> program, so the benchmark does not include it.</Note
		>.
	</p>
	<p>
		The values in these tables come from a JSON (JavaScript Object Notation) report that build
		<code>{data.build.rev.slice(0, 10)}</code> measured, committed as site data. Running time changes with machine load, so the
		automatic check on each change does not watch it, and these values stay the same until someone measures again. The effect
		of a change is measured with the counts of the baseline check above.
	</p>
</div>

<Code item={data.code.doc} />

<div class="prose-learn">
	<p>
		Timed rounds alternate between running the configurations in order and in reverse order (every second round is reversed).
		The result is the median of {data.rounds} rounds. Allocations and peaks come from a separate round that tracks the whole
		process (Chapter <a href="/en/learn/kernel/measurement#global">11</a>). There are two builds, without metrics and with
		metrics, and each one ran twice.
	</p>

	<H2 id="time" />
</div>

<figure class="my-8 overflow-x-auto xl:mr-[calc(-232px-48px)]">
	<table class="table min-w-[640px]">
		<thead>
			<tr><th>Configuration</th><th class="w-[30%]"></th><th class="num">Plain build (milliseconds)</th><th class="num">Metrics build (milliseconds)</th><th class="num">Each round (plain, run 1)</th></tr>
		</thead>
		<tbody>
			{#each data.arms as x (x.name)}
				<tr>
					<td><code>{x.name}</code><div class="text-[13px] text-muted">{armDoc[x.name]}</div></td>
					<td class="align-middle"><div class="h-2 bg-surface"><div class={['h-2', x.name === 'shared' ? 'bg-fg' : 'bg-line-strong']} style:width="{(x.plain[0] / maxMs) * 100}%"></div></div></td>
					<td class="num">{x.plain.map((v) => v.toFixed(1)).join(' / ')}</td>
					<td class="num">{x.metrics.map((v) => v.toFixed(1)).join(' / ')}</td>
					<td class="num font-mono text-[12px] text-muted">{data.rawRounds[x.name].map((v) => v.toFixed(0)).join(' ')}</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<figcaption class="mt-2 text-[13px] leading-[1.7] text-muted">
		Medians of 2 runs each, without and with the measurement feature. The thread count is {data.threads}. The build profile is
		{data.build.profile}, and the commit is {data.build.rev.slice(0, 10)}.
	</figcaption>
</figure>

<div class="prose-learn">
	<ul>
		<li>
			Sharing: shared is {(a('isolated').plain[0] / a('shared').plain[0]).toFixed(1)} times faster than isolated (Chapter <a
				href="/en/learn/kernel/database#sharing">04</a
			>).
		</li>
		<li>
			Parallel work: shared is {(a('serial').plain[0] / a('shared').plain[0]).toFixed(1)} times faster than serial ({data.threads}
			threads).
		</li>
		<li>
			Pool: shared takes {((1 - a('shared').plain[0] / a('nopool').plain[0]) * 100).toFixed(0)}% less time than nopool (Chapter <a
				href="/en/learn/kernel/buffer-pool#measure">12</a
			>).
		</li>
		<li>
			Streaming: the time difference is about the same as the difference between two runs of the same configuration ({Math.abs(a('streaming').plain[0] - a('streaming').plain[1]).toFixed(1)}
			milliseconds), so we cannot say that there is a difference.
		</li>
	</ul>

	<H2 id="memory" />
</div>

<figure class="my-8 overflow-x-auto">
	<table class="table">
		<thead><tr><th>Configuration</th><th class="num">Allocations</th><th class="num">Bytes</th><th class="num">Allocations per input byte</th><th class="num">Peak growth</th></tr></thead>
		<tbody>
			{#each data.arms as x (x.name)}
				<tr>
					<td><code>{x.name}</code></td>
					<td class="num">{fmt(x.allocations)}</td>
					<td class="num">{mb(x.allocBytes)} megabytes</td>
					<td class="num">{x.allocationsPerByte.toFixed(3)}</td>
					<td class={['num', x.name === 'streaming' && 'font-medium']}>{mb(x.peak)} megabytes</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<figcaption class="mt-2 text-[13px] leading-[1.7] text-muted">
		Run 1 of the metrics build, from the round that tracks the whole process ({data.threads} threads). The most physical memory
		that the process used is {mb(data.maxRss)} megabytes (the highest value for the process, which runs all configurations).
		These numbers cannot be compared with the counts of the baseline check, which uses 1 thread, the last round, and a different
		set of tasks.
	</figcaption>
</figure>

<div class="prose-learn">
	<p>
		In every configuration that keeps all results, the peak growth is about {mb(a('shared').peak)} megabytes, whatever the
		thread count (serial: {mb(a('serial').peak)} megabytes). So holding all results dominates the peak, not the work in
		progress. If <code>run_each</code> drops each result right away, the peak is {mb(a('streaming').peak)} megabytes (Chapter <a
			href="/en/learn/kernel/pipeline#run-each">06</a
		>).
	</p>

	<H2 id="phases" />
	<p>
		This is the phase table from one run of shared in the metrics build. Self time is the time without nested phases, added up
		over all threads.
	</p>
</div>

<figure class="my-8 overflow-x-auto xl:mr-[calc(-232px-48px)]">
	<table class="table min-w-[640px]">
		<thead><tr><th>Phase</th><th class="num">Calls</th><th class="num">Self time (milliseconds)</th><th class="num">Share</th><th class="num">Self allocations</th><th class="num">Self bytes</th></tr></thead>
		<tbody>
			{#each data.phases as p (p.name)}
				<tr>
					<td><code>{p.name}</code></td>
					<td class="num">{fmt(p.calls)}</td>
					<td class="num">{p.self_ms.toFixed(1)}</td>
					<td class="num">{((p.self_ms / totalSelf) * 100).toFixed(1)}%</td>
					<td class="num">{fmt(p.self_allocations)}</td>
					<td class="num">{mb(p.self_bytes)} megabytes</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<figcaption class="mt-2 text-[13px] leading-[1.7] text-muted">Each share is of the total self time in this table. Build {data.build.rev.slice(0, 10)}.</figcaption>
</figure>

<div class="prose-learn">
	<p>
		<code>svelte.parse</code> runs once for every document, and the phases after it run only for documents that parsed. The
		compile tasks themselves have very little self time. The time goes to the computed results that they request, and to
		<code>svelte.lower.*</code> and <code>js.print</code>.
	</p>

	<H2 id="reproduce" />
</div>

<pre class="my-6 overflow-x-auto rounded-sm border border-line bg-sunken p-4 text-[13px] leading-[1.7]"><code
		># Performance check (allocations; works on any platform)
mise run performance
mise run performance:update

# Instruction counts (in the same arm64 Linux container as continuous integration)
tools/performance/linux.sh
tools/performance/linux.sh --update

# Wall-clock benchmark
cargo build --release -p rsvelte_command_line --features metrics
./target/release/rsvelte benchmark fixtures/svelte rounds=5 json=benchmark.json</code
	></pre>

<div class="prose-learn">
	<p>
		In the report of <code>rsvelte benchmark</code>, <code>build.rev</code> is the <code>git rev-parse HEAD</code> of the built
		tree (with <code>-dirty</code> added if the tree has changes). A field that has no value says <code>UNMEASURED</code>, not 0.
	</p>
	<p>
		The benchmark data of this site (<code>apps/site/src/lib/data/benchmark/</code>) is the output of an old build
		(d6f426e250). Its field names were rewritten later (e9c1458ade). For example, the current command writes
		<code>allocs</code>, but the data says <code>allocations</code>. So the output of the current command cannot be used as
		site data without changes.
	</p>
</div>

<ChapterFooter chapter={c} />
