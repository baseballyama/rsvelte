<script lang="ts">
	import Term from '$lib/components/Term.svelte';
	import ChapterFooter from '$lib/components/ChapterFooter.svelte';
	import ChapterHeader from '$lib/components/ChapterHeader.svelte';
	import Code from '$lib/components/Code.svelte';
	import H2 from '$lib/components/H2.svelte';
	import Note from '$lib/components/Note.svelte';
	import { chapter } from '$lib/site';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const c = chapter('polish', 'en');

	type Status = 'fixed' | 'docs' | 'upstream' | 'measured' | 'open';
	const label: Record<Status, string> = {
		fixed: 'Fixed',
		docs: 'Documentation fixed',
		upstream: 'Same as upstream',
		measured: 'Measured, not changed',
		open: 'Not started'
	};
	const workingTree = 'Working tree (not committed)';
	const ms = (v: number) => v.toFixed(1);
	const fmt = (n: number) => n.toLocaleString('en-US');
	const delta = (now: number | null, was: number | null | undefined) =>
		now === null || was === null || was === undefined || now === was ? '' : `${now > was ? '+' : '−'}${(Math.abs(now / was - 1) * 100).toFixed(1)}%`;
	const firstInstr = $derived(data.history.find((r) => r.instructions !== null)!);
	const lastRec = $derived(data.history.at(-1)!);
	const firstLoad = $derived(data.history.find((r) => r.load_instructions !== null)!);
	const maxInstr = $derived(Math.max(...data.history.map((r) => r.instructions ?? 0)));
</script>

<svelte:head><title>{c.title} — rsvelte Learn</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="This chapter shows how the optimizations recorded by the check against the performance baseline changed the counts. It also lists the places worth fixing that we found by reading the kernel. For each fix, the other chapters now describe the fixed code. For each item that we did not fix, this chapter gives the reason."
/>

{#snippet item(n: string, title: string, status: Status, where: string)}
	<h3 class="mt-12 flex flex-wrap items-baseline gap-x-3 text-[19px] leading-[1.55] font-semibold">
		<span class="font-mono text-[13px] font-normal tracking-normal text-muted">{n}</span>{title}
		<span
			class={[
				'rounded-xs border px-1.5 font-mono text-[11.5px] font-normal tracking-normal',
				status === 'open' ? 'border-accent text-accent' : 'border-line-strong text-fg-2'
			]}>{label[status]}</span
		>
	</h3>
	<p class="mt-1 font-mono text-[12px] tracking-normal text-muted">{where}</p>
{/snippet}

<div class="prose-learn">
	<H2 id="history" />
	<p>
		The table lists the commits that changed <code>tools/performance/baseline.json</code>, oldest first, with the values that
		each one recorded (Chapter <a href="/en/learn/measure#ratchet">13</a>). The site reads these values from the git history at
		each build (<code>src/lib/build/performance-history.ts</code>). If the baseline has changes that are not committed yet, the
		last row shows those values for the working tree. Instruction counts are for 1 round, counted with cachegrind on arm64
		Linux.
	</p>
	<p>
		The instruction count went from {fmt(firstInstr.instructions!)} at <code>{firstInstr.sha ?? workingTree}</code>, the first
		commit that recorded it, to {fmt(lastRec.instructions!)} now ({delta(lastRec.instructions, firstInstr.instructions)}).
		Allocations went from {fmt(data.history[0].allocations)} at first to {fmt(lastRec.allocations)} ({delta(
			lastRec.allocations,
			data.history[0].allocations
		)}), and allocated bytes went from {fmt(data.history[0].alloc_bytes)} to {fmt(lastRec.alloc_bytes)} ({delta(
			lastRec.alloc_bytes,
			data.history[0].alloc_bytes
		)}). Instructions for loading went from {fmt(firstLoad.load_instructions!)} at
		<code>{firstLoad.sha ?? workingTree}</code>, where recording started, to {fmt(lastRec.load_instructions!)}. Loading was
		first recorded by the same change that reduced loading from 878,552,187 instructions (according to its commit message).
		The drop in loading in the <code>201b86fd6b</code> row is a correction to the measurement, not an optimization (Chapter <a
			href="/en/learn/measure#ci">13</a
		>).
	</p>
</div>

<figure class="my-8 overflow-x-auto xl:mr-[calc(-232px-48px)]">
	<table class="table min-w-[760px]">
		<thead>
			<tr>
				<th>Commit</th>
				<th class="w-[18%]">Instructions</th>
				<th class="num"></th>
				<th class="num">Allocations</th>
				<th class="num">Bytes</th>
				<th class="num">Loading</th>
			</tr>
		</thead>
		<tbody>
			{#each data.history as r, i (r.sha ?? "working-tree")}
				{@const prev = data.history[i - 1]}
				<tr>
					<td>
						{#if r.sha === null}{workingTree}{:else}<code>{r.sha}</code><div class="text-[13px] text-muted" lang="en">{r.subject}</div>{/if}
					</td>
					<td class="align-middle">
						{#if r.instructions !== null}
							<div class="h-2 bg-surface"><div class="h-2 bg-fg" style:width="{(r.instructions / maxInstr) * 100}%"></div></div>
						{/if}
					</td>
					<td class="num">
						{r.instructions === null ? '—' : fmt(r.instructions)}
						<div class="text-[12px] text-muted">{delta(r.instructions, prev?.instructions)}</div>
					</td>
					<td class="num">{fmt(r.allocations)}<div class="text-[12px] text-muted">{delta(r.allocations, prev?.allocations)}</div></td>
					<td class="num">{fmt(r.alloc_bytes)}<div class="text-[12px] text-muted">{delta(r.alloc_bytes, prev?.alloc_bytes)}</div></td>
					<td class="num">
						{r.load_instructions === null ? '—' : fmt(r.load_instructions)}
						<div class="text-[12px] text-muted">{delta(r.load_instructions, prev?.load_instructions)}</div>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<figcaption class="mt-2 text-[13px] leading-[1.7] text-muted">
		Each row is the <code>baseline.json</code> of that commit. Each difference is relative to the row above. A dash (—) marks a
		quantity that was not counted yet: the baseline records instructions from row 2, and loading from a5822ee26f. At
		<code>b58a0a72be</code>, the population gains 1 document (<code>minimal/emoji-width.svelte</code>). From <code
			>9226b2278b</code
		> on, the rows measure populations with documents and tasks added or removed, so their differences also include the change
		in the population.
	</figcaption>
</figure>

<div class="prose-learn">
	<p>
		These are the changes that moved the table the most, and how each one works. The numbers are quoted from the commit
		messages.
	</p>
	<ul>
		<li>
			<strong>Lexing punctuators</strong> (49aeb2de94, instructions −29.4%): The lexer tried 58 operators in turn with
			<code>starts_with</code>, then matched the text of the winner against the token kinds. In 1 round, this made 40 million
			<code>memcmp</code> calls, 13% of all instructions. Now the lexer branches on the first byte and looks at the
			next bytes to choose the longest punctuator.
		</li>
	</ul>
</div>

<Code item={data.code.punct} />

<div class="prose-learn">
	<p>
		The test keeps the old operator table as the definition. For every string of up to 4 bytes made of operator characters, it
		checks that the branching gives the same answer as the table.
	</p>
</div>

<Code item={data.code.punctTest} />

<div class="prose-learn">
	<ul>
		<li>
			<strong>Compute breaks in the formatting data when the nodes are made</strong> (708a4403d5, instructions −4.07%): We removed
			<code>propagate_breaks</code>, which ran before printing, and its memo, and made <code>will_break</code> a table lookup.
			The arena's buffers also go into the pool. The allocations of <code>svelte.format</code> went from 1,070,011 to 691,547
			(Chapter <a href="/en/learn/kernel/document#printer">08</a>).
		</li>
		<li>
			<strong>Loading</strong> (a5822ee26f, loading instructions −60.7%): Most of loading was <code>Path</code> parsing.
			Sorting the test cases compared path components, and each test case walked up its ancestors to look for
			<code>_registry/</code> (with a <code>stat</code> call each time) and then removed a prefix. Now the walk visits the
			entries of each directory in name order, depth first, so the test cases come out in <code>Path::cmp</code> order without
			a sort. The walk carries the depth and the path relative to the source, and reads each entry's type from the directory
			instead of calling <code>stat</code>.
		</li>
		<li>
			<strong>Pool the token tables and the template columns</strong> (92571ee562, bytes −45%): See Chapter <a
				href="/en/learn/kernel/buffer-pool#users">12</a
			>.
		</li>
		<li>
			We gathered the parser's working arrays into one (d5060ddc01, allocations −8.1%). Before, the parser collected each list,
			such as statements or arguments, in its own array and then copied it into the syntax tree. This caused 235,000 memory
			allocations in 1 round. Now the parser pushes onto one stack that <code>SyntaxTree</code> owns. Lists nest, so the list
			opened last is always on top. Closing a list builds its node from the top of the stack and removes those items. Debug
			builds check that a successful parse closed every list that it opened.
		</li>
	</ul>
</div>

<Code item={data.code.parserClose} />

<div class="prose-learn">
	<ul>
		<li>
			<strong>Pool keys for each owner</strong> (20f5846343, allocations −6.7%): See Chapter <a
				href="/en/learn/kernel/buffer-pool#keyed">12</a
			>.
		</li>
		<li>
			<strong>Pass tokens to an embedded language</strong> (ff65a1e66b, bytes −19%): For each template expression, the code
			collected the tokens and comments that the JavaScript parser recorded into a vector, and passed that vector on. This
			was 36 megabytes in 1 round, or 1 in every 5 allocated bytes. Now an iterator merges them in order while it passes them
			on.
		</li>
	</ul>
</div>

<Code item={data.code.recorded} />

<div class="prose-learn">
	<ul>
		<li>
			<strong>Read template lists without collecting them</strong> (7908907666, allocations −7.6%): The attributes of an
			element and the parts of an attribute do not nest. So they go straight onto the component's columns, and the lengths
			before and after give their range. Children do nest. So they are gathered on one stack and moved to
			<code>children</code> when the fragment closes.
		</li>
		<li>
			<strong>Pass the line index to the formatters</strong> (42b6e550e1, instructions −1.5%): The line index, built once for
			each document, now goes to the Svelte and Vue formatters too, not only to lint (Chapter <a
				href="/en/learn/kernel/database#attribution">04</a
			>).
		</li>
		<li>
			<strong>The formatter does not copy the component's content</strong> (e0ef873545, allocations −7.8%): Because of the
			borrowing rules, the formatter copied element children, attribute parts, and text. Now it borrows them for the lifetime
			of the component (Chapter <a href="/en/learn/kernel/document#ir">08</a>).
		</li>
		<li>
			<strong>Copy the strings of the structured data writer one run at a time</strong> (a6eed170c4, instructions −0.6%): See
			Chapter <a href="/en/learn/kernel/structured-data#escape">10</a>.
		</li>
	</ul>
	<p>
		Some changes increased the instruction count. Computing character width with the same table as the official tool cost
		+0.22% (b58a0a72be). Using a spare value of each identifier type cost +0.08%, and putting a limit on reused memory cost
		+0.22% (36c3539efb, e8eef831d3). Each of these changes keeps the output correct or keeps memory use within a limit. The
		chapters give the reason for each one.
	</p>

	<H2 id="correctness" />

	{@render item('P1', 'The written source map and lookup gave different answers', 'fixed', 'output/emitter.rs: Emitter::source_map, Emitter::lookup')}
	<p>
		<code>source_map</code> wrote one segment for each Mapping. So a source map reader mapped every position inside a copy to
		the start of the copy. Now it writes one segment for each character of a copy, and <code>lookup</code> searches “on the
		same generated line,” as the readers do. The test decodes the written source map and compares the two answers at every
		position of the output (Chapter <a href="/en/learn/kernel/emitter#disagreement">09</a>).
	</p>
	<p>While we fixed this, we found three more defects in the same place:</p>
	<ul>
		<li>A copy that spanned several lines had no segments after its first line, so those lines were not mapped.</li>
		<li>
			A lookup of inserted text after a copy returned a byte in the middle of a character when the last character of the copy
			was multibyte.
		</li>
		<li>
			The type check task took the generated text out of the Emitter when it passed the text to tsc, so a later
			<code>lookup</code> worked on empty text. This did not show before, because the old <code>lookup</code> did not read
			the text.
		</li>
	</ul>
	<p>
		We compared all outputs for the test source collection before and after the change. The compile, lint, and type check
		outputs did not change by a single byte<Note
			>We ran <code>rsvelte fixtures</code> with the binaries from before and after the change, and compared the hashes of every
			file in <code>actual/</code>. Only the formatting diagnostic files changed, because of C3.</Note
		>.
	</p>

	{@render item('P2', 'LineIndex::offset rounded columns that do not exist', 'fixed', 'source/positions.rs: LineIndex::offset')}
	<p>
		A column past the end of a line, or a column inside a surrogate pair, now gives <code>None</code>. The only caller that
		relied on the rounding was the parser for tsc reports. We confirmed with real output of tsc 7.0.2 that tsc underlines a
		range of width 0 at the end of a line one column further. The report parser handles only that one case (Chapter <a
			href="/en/learn/kernel/source#offset">02</a
		>).
	</p>

	{@render item('P3', 'Range checks ran only in debug builds', 'fixed', 'output/emitter.rs: Edits::apply_in; lint/rules.rs: run; check/report.rs: parse_report')}
	<p>
		Release builds now also check that <code>Edits</code> do not overlap and stay in range, and that each lint rule reports
		with its own identifier. <code>Span::new</code> keeps <code>debug_assert!</code>, because it is the most used path: it
		builds a Span from text that the parser has read. Instead, the report parser checks positions that come from outside (tsc
		reports) before it builds a Span.
	</p>

	{@render item('P4', 'The LayoutInstruction arena can be changed in place', 'upstream', 'output/document.rs: LayoutInstructions::trim_left, trim_right, replace_parts')}
</div>

<Code item={data.code.trimLeft} mark={['self.replace_parts(d, &inner);']} />

<div class="prose-learn">
	<p>
		<code>trim</code> replaces the child list of an existing node. If the same node is used in two places, a <code>trim</code>
		of one also changes the other. We did not fix this. Upstream, <code>trimLeft</code> in prettier-plugin-svelte also changes
		the array that <code>getParts</code> returned in place, with <code>splice</code>. When formatting data is shared, the
		official tool does the same thing<Note>We checked this in <code>plugin.js</code> of prettier-plugin-svelte 4.1.1.</Note>. If
		<code>trim</code> returned a new node instead, the output in that case would differ from upstream.
	</p>

	{@render item('P5', 'A panic message could be empty', 'fixed', 'computation/pipeline.rs: panic_message')}
	<p>
		When the panic value is not a string, the message is now a fixed sentence instead of an empty string (Chapter <a
			href="/en/learn/kernel/pipeline#run-document">06</a
		>).
	</p>

	{@render item('P6', 'LineIndex::utf16 overflowed in the middle of a multibyte character', 'fixed', 'source/positions.rs: LineIndex')}
	<p>
		The old column conversion read the previous character and subtracted its length. When you gave it a position in the middle
		of a multibyte character, the subtraction overflowed. Development builds stopped with a panic, and optimized builds returned
		a huge column number. For example, <code>utf16("é", 1)</code> did this. Now the index stores the byte range and the column
		of each character in a table, and answers with a binary search (91fec70a6d, Chapter <a href="/en/learn/kernel/source#utf16"
			>02</a
		>).
	</p>

	{@render item('P7', 'A shouldBreak group did not break its parent group', 'fixed', 'output/document.rs: LayoutInstructions::push')}
	<p>
		A group made with <code>group_broken</code> did not break its parent group, so the output differed from Prettier
		(708a4403d5, Chapter <a href="/en/learn/kernel/document#printer">08</a>).
	</p>

	{@render item('P8', 'String width differed from Prettier', 'fixed', 'output/width.rs: string_width')}
	<p>
		Emoji, variation selectors, and zero-width characters were counted differently. Now the width follows the Unicode width
		rules (unicode-width). Matching the Prettier table is not a goal (5b760bf1fc, Chapter <a
			href="/en/learn/kernel/document#flat-only">08</a
		>).
	</p>

	{@render item('P9', 'Anything could be written where the structured data writer expects a number', 'fixed', 'output/structured_data.rs: StructuredDataWriter::write_number, fixed')}
	<p>
		Integers and decimals now have separate functions, and a decimal that is not finite is written as <code>null</code>
		(37a595c11e, Chapter <a href="/en/learn/kernel/structured-data#state">10</a>).
	</p>

	<H2 id="contracts" />

	{@render item('C1', 'The documentation example for Task::id did not match the real identifiers', 'fixed', 'computation/pipeline.rs: Task::identifier')}
	<p>
		We corrected it to the real form <code>&lt;language&gt;.&lt;task&gt;/&lt;variant&gt;</code> and a real example
		(<code>svelte.compile/client</code>). Later the documentation was rewritten. It now says only that this is a name used for
		task selection and measurement, and it does not fix the form of the name.
	</p>

	{@render item('C2', 'Unknown task identifiers were ignored without notice', 'fixed', 'computation/pipeline.rs: Registry::check_task_identifiers, run_each')}
	<p>
		If an identifier is unknown, <code>run_each</code> and <code>run</code> now return <code>Err(UnknownTask)</code> without
		running anything. The command line program checks with the same function (Chapter <a
			href="/en/learn/kernel/pipeline#registry">06</a
		>).
	</p>

	{@render item('C3', 'Unsupported had no location', 'fixed', 'diagnostics/diagnostic.rs: Unsupported')}
	<p>
		<code>Unsupported</code> now holds the location of the refused syntax (<Term name="SourceLocation" />). The diagnostics
		from formatting and from the code generated for type checking point to that syntax. Only a decision about the whole
		document (a layout that does not fit on one line) has no position, and it says so with <code>nowhere</code>. The style
		sheet formatter now uses the same type (Chapter <a href="/en/learn/kernel/diagnostics#unsupported">07</a>).
	</p>

	{@render item('C4', 'The design notes and the code disagreed', 'docs', 'docs/concept.md')}
	<p>
		We changed the design notes to match the code. The position type has no file information; it holds only a range. A needed
		result is computed when something requests it, not from a plan made in advance. The notes now state that reusing past
		results by comparing file contents is not implemented.
	</p>

	<H2 id="performance" />

	{@render item('F1', 'Phase rows are found by a linear search by name', 'measured', 'performance/measurement.rs: PhaseGuard::drop')}
	<p>
		A microbenchmark of one guard showed that about half of its time went to the two clock reads for timing. Even with a high
		estimate for the table lock and the search, multiplied by the number of calls, the cost stays under 1% of the time of a
		metrics build. A lookup by number would make the structure more complex, so we did not change it for now.
	</p>

	{@render item('F2', 'Preparing the whole-project work cost tasks × documents', 'open', 'computation/pipeline.rs: run_finish_tasks')}
	<p>
		We changed the code so that one pass sends the parts to each finish task (a task over the whole project). But each finish
		task that has parts rebuilds the table that borrows the outputs of all documents. So the total work is still (finish tasks
		with parts) × (outputs of all documents). This remaining cost is not fixed yet. We corrected the function comment to state
		this cost (dbe55a0683, Chapter <a href="/en/learn/kernel/pipeline#project">06</a>).
	</p>

	{@render item('F3', 'Documents that wait for whole-project work hold the output of every task', 'open', 'computation/pipeline.rs: run_each')}
</div>

<Code item={data.code.runEach} mark={['.push((i, r));']} />

<div class="prose-learn">
	<p>
		A document with parts goes into the waiting list as a whole <code>DocumentResult</code>. So its compile and format outputs
		are not freed until the type check ends. A fix would split a document's result into final output and output that waits
		for whole-project work, and pass the final output to the sink first. That changes the condition that the sink relies on
		(one call for each document). We will decide after we discuss it with the callers.
	</p>

	{@render item('F4', 'Small waste in the pool and the threads', 'fixed', 'performance/buffer_pool.rs: take; computation/pipeline.rs: in_pool, run_document')}
	<ul>
		<li>
			A run with <code>RunOptions::threads</code> set built a new thread pool every time. Now the process keeps one pool, for
			the thread count used last.
		</li>
		<li>
			With <code>Sharing::Isolated</code>, the run still built the <code>shared</code> store (<Term name="DocumentContext" />),
			which it never used. Now the run builds it the first time something requests it.
		</li>
		<li>
			<span class="text-accent">Not started</span>: <code>take</code> is last in, first out, so it can give a small buffer to
			a large document. <code>take</code> does not know the size that is needed. So a different choice would need the caller
			to pass an expected size. We will measure before we decide which choice helps.
		</li>
	</ul>
</div>

<Code item={data.code.take} />

<div class="prose-learn">
	{@render item('F5', 'Interner grew its table even on a hit', 'fixed', 'source/interning.rs: Interner::intern')}
	<p>It now checks whether to grow only when the name is not found (Chapter <a href="/en/learn/kernel/interning#growth">03</a>).</p>

	{@render item('F6', 'run took a lock for each document', 'fixed', 'computation/pipeline.rs: run')}
	<p>
		Results are now collected in order with rayon's <code>collect</code>. The allocation count no longer depends on the platform
		(a5f67528cd, Chapter <a href="/en/learn/kernel/pipeline#run">06</a>).
	</p>

	<h3 class="mt-12 text-[19px] leading-[1.55] font-semibold">Effect on performance</h3>
	<p>
		F2, F4, and F5 are performance fixes, but the time for the whole test source collection did not move. The table shows
		medians in milliseconds (plain build). We ran the same collection ({data.polish.documents.toLocaleString('en-US')} documents)
		in this order: before, after, after, before.
	</p>
	<div class="overflow-x-auto"><table class="table">
		<thead>
			<tr><th>Configuration</th><th class="num">Before (run 1 / run 2)</th><th class="num">After (run 1 / run 2)</th></tr>
		</thead>
		<tbody>
			{#each data.polish.arms as a (a.name)}
				<tr>
					<td><code>{a.name}</code></td>
					<td class="num">{ms(a.before[0])} / {ms(a.before[1])}</td>
					<td class="num">{ms(a.after[0])} / {ms(a.after[1])}</td>
				</tr>
			{/each}
		</tbody>
	</table></div>
	<p>
		The difference between before and after is smaller than the spread between two runs of the same configuration. So we
		cannot say that the fixes made it faster or slower. Keeping the thread pool did not change <code>serial</code> either, so
		the cost of rebuilding the pool was too small to matter<Note
			>Spotlight indexing was running while we measured. We alternated before and after so that this noise affects both sides
			equally.</Note
		>.
	</p>

	<H2 id="measurement" />

	{@render item('M1', 'The peak is growth, and negative live bytes become 0', 'docs', 'performance/measurement.rs: GlobalMeasurements')}
	<p>
		The documentation of <code>peak_live_growth</code> now says two things. Memory allocated before tracking starts is not
		included. Freeing that memory makes the live amount negative, which reads as “no growth.”
	</p>

	{@render item('M2', 'The self time of a phase is a sum of thread times', 'docs', 'performance/measurement.rs: PhaseMeasurements')}
	<p>
		The times in <code>PhaseMeasurements</code> are the wall-clock time on the thread that ran the phase, added up over the
		threads. They are neither processor time nor elapsed time. So the documentation of <code>PhaseMeasurements</code> now says
		to read them as shares of the whole.
	</p>

	{@render item('M3', 'A phase guard could be dropped on another thread', 'fixed', 'performance/measurement.rs: PhaseGuard')}
	<p>
		The guard is now a type that is not <code>Send</code>, and dropping guards in the wrong order stops a debug build. Also,
		<Term name="CountingAllocator" /> now forwards <code>alloc_zeroed</code> (2f8bef970a, Chapter <a
			href="/en/learn/kernel/measurement#phases">11</a
		>).
	</p>

	{@render item('M4', "The instruction baseline measured the working tree's test inputs and expected outputs", 'fixed', 'tools/performance/linux.sh')}
	<p>
		It now measures a snapshot of the staged test inputs and expected outputs (201b86fd6b, Chapter <a
			href="/en/learn/measure#ci">13</a
		>).
	</p>
</div>

<ChapterFooter chapter={c} />
