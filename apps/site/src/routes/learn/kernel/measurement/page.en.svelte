<script lang="ts">
	import ChapterFooter from '$lib/components/ChapterFooter.svelte';
	import ChapterHeader from '$lib/components/ChapterHeader.svelte';
	import Code from '$lib/components/Code.svelte';
	import DeepDive from '$lib/components/DeepDive.svelte';
	import H2 from '$lib/components/H2.svelte';
	import Note from '$lib/components/Note.svelte';
	import { chapter } from '$lib/site';
	import PhaseTimeline from '$lib/widgets/PhaseTimeline.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const c = chapter('metrics', 'en');
	const shared = $derived(data.arms.find((a) => a.name === 'shared')!);
	const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;
</script>

<svelte:head><title>{c.title} — rsvelte Learn</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="A discussion about performance can start only after you measure. The kernel was built to count, from the start, which phase uses time and how many times it allocates memory. When you do not use measurement, none of the measurement code is left in the build."
/>

<div class="prose-learn">
	<H2 id="alloc" />
	<p>
		<dfn>CountingAllocator</dfn> is a global allocator that wraps the system allocator. It is active only when a binary selects it with <code>#[global_allocator]</code>
		(the <code>rsvelte</code> command line program selects it when the <code>metrics</code> feature is on).
	</p>
</div>

<Code item={data.code.alloc} />
<Code item={data.code.counted} />

<div class="prose-learn">
	<p>
		It adds the number of allocations and the bytes to counters local to the thread. Because the counters are local to each thread, threads that run in parallel do not compete for them. The two numbers are stored as a pair in one
		<code>Cell</code>, so each allocation needs only one access to thread-local storage. It uses <code>try_with</code>
		because an allocation can happen while a thread is shutting down, after its thread-local storage is already gone. When the system allocator fails (returns null), nothing is counted.
	</p>
	<p>
		<code>alloc_zeroed</code>, which allocates memory filled with zeros, is also forwarded to the system implementation.
		The default implementation allocates the memory and then writes zero to every byte.
		Forwarding lets it use memory that the system has already filled with zeros.
		Without forwarding, only the builds with measurement would be slower (2f8bef970a).
	</p>
	<p>
		Unlike time, allocation counts are the same under the same conditions. If you process the same input on 1 thread, you get the same numbers every time.
		The automatic check on each change tests whether the allocation count and the bytes match the recorded values (Chapter <a
			href="/en/learn/measure#ratchet">13</a
		>, “Checks against performance baselines”)<Note>Time changes with how busy the machine is, so it is not suitable for the automatic check on each change.</Note>.
	</p>

	<H2 id="phases" />
	<p>
		A <dfn>phase</dfn> is a guard that counts the time and the allocations of a scope under a name. If you write <code>let _p = measurement::phase("js.print");</code>,
		everything until the block ends is counted in the <code>js.print</code> row, under the name you passed.
	</p>
</div>

<Code item={data.code.guard} />
<Code item={data.code.notSend} />
<Code item={data.code.phase} />
<Code item={data.code.drop} mark={['debug_assert_eq!(s.len(), self.depth', 'parent.child_ns += total_ns;', 'row.self_ns += total_ns.saturating_sub(f.child_ns);', '.position(|r| r.name == f.name)']} />

<div class="prose-learn">
	<p>
		When a guard is dropped, it adds its total to the “children total” of its parent frame. To its own row, it adds <dfn>self</dfn>: its total minus its children total.
		So phases are <strong>exclusive</strong>. The sum of self over all phases equals the total of the outermost phase.
	</p>
	<p>
		A guard takes its frame from the stack of its thread. So it must be dropped on the thread that created it, in the reverse order of creation. For this reason, <code>PhaseGuard</code>
		is a type that is not <code>Send</code> (it holds a <code>PhantomData&lt;*const ()&gt;</code>), and code that passes it to another thread does not compile. A compile-time check also fixes that it is not <code
			>Send</code
		>
		(the <code>const _</code> below: if it were <code>Send</code>, both impls would apply, the call would be ambiguous, and compilation would stop). A guard remembers the stack depth at the time it was created. If guards are dropped in the wrong order, the <code>debug_assert</code> of a debug
		build fails. The guard without the metrics feature is also a type that is not <code>Send</code>, so code that compiles without the feature
		also compiles with it.
	</p>
	<p>
		Computed results, tasks, and rules are all phases. So parsing is counted in <code>svelte.parse</code>,
		not in the task that asked for it first (Chapter <a href="/en/learn/kernel/database#attribution">04</a>). In the figure below, try changing the order of the tasks.
	</p>
</div>

<PhaseTimeline avg={data.avg} rev={data.benchRev} />

<div class="prose-learn">
	<p>
		Finding a row is a linear search by name, and each time a guard is dropped, it also takes the <code>Mutex</code>
		of the table of that thread (there is no contention). A measurement showed that about half the time of one guard is two clock reads for timing. The estimate for the search and the lock was under 1% of the time of a metrics
		build. This would matter with many more kinds of phases, but for now the code keeps the simple form (Chapter <a
			href="/en/learn/polish#performance">14</a
		>, “Places to improve”).
	</p>
</div>

<div class="prose-learn">
	<H2 id="merge" />
	<p>
		Each thread has its own table, and the table is registered in the global list <code>ALL</code> when it is created. <code>snapshot</code>
		merges the tables of all threads by name and sorts the rows by self, largest first.
	</p>
</div>

<Code item={data.code.snapshot} />

<div class="prose-learn">
	<p>
		Because it adds up the time of all threads, the sum of self is the total thread time, not the elapsed time. Work that ran for 60 ms on 10 threads
		can add up to as much as 600 ms. Read the phase table of the benchmark as shares of the whole.
	</p>

	<H2 id="global" />
	<p>
		To find the memory peak, you need totals across threads. With <code>track_global(true)</code>, each allocation and each free updates shared atomic variables, which follow the amount of live heap memory and its maximum.
	</p>
</div>

<Code item={data.code.trackGlobal} />
<Code item={data.code.global} />

<div class="prose-learn">
	<p>
		Atomic updates make the allocations of all threads compete for the same cache line. So the benchmark turns tracking off in the rounds that measure time, and gets the allocations and the peak in a separate round.
	</p>

	<DeepDive title="The peak is only “growth”">
		<p>
			<code>track_global(true)</code> starts counting live memory from 0. If memory allocated before tracking started is freed later, the live amount goes below zero. <code
				>global()</code
			>
			raises a negative peak to 0.
		</p>
		<p>
			So this value is not “the most memory the process used.” It is “the largest growth since tracking started.” That is why the field is named
			<code>peak_live_growth</code>. The maximum for the whole process is taken separately: the maximum physical memory used by the process (the maximum resident set size), from <code>getrusage</code>.
		</p>
	</DeepDive>

	<H2 id="off" />
	<p>
		Without the <code>metrics</code> feature, <code>phase</code> is a function that does nothing, and the guard is an empty type. They are <code
			>#[inline(always)]</code
		>,
		so the optimizer removes them, including the call.
	</p>
</div>

<Code item={data.code.off} />

<div class="prose-learn">
	<p>
		The cost of the feature is measured. In build <code>{data.benchRev.slice(0, 10)}</code>, the median of the <code>shared</code> arm was {mean(shared.plain).toFixed(1)} ms in the build without metrics
		and {mean(shared.metrics).toFixed(1)} ms in the build with metrics (each the mean of 2 runs). That is about
		{((mean(shared.metrics) / mean(shared.plain) - 1) * 100).toFixed(0)}% more. So conclusions about time come from the build without metrics. The performance baseline check splits the work in the same way: it counts allocations
		in the build with metrics, and instructions in the shipped build without metrics.
	</p>
</div>

<ChapterFooter chapter={c} />
