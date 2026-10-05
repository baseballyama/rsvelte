<script lang="ts">
	import Term from '$lib/components/Term.svelte';
	import ChapterFooter from '$lib/components/ChapterFooter.svelte';
	import ChapterHeader from '$lib/components/ChapterHeader.svelte';
	import Code from '$lib/components/Code.svelte';
	import DeepDive from '$lib/components/DeepDive.svelte';
	import H2 from '$lib/components/H2.svelte';
	import Note from '$lib/components/Note.svelte';
	import { chapter } from '$lib/site';
	import PoolViz from '$lib/widgets/PoolViz.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const c = chapter('pool', 'en');
	const pct = (a: number, b: number) => ((1 - a / b) * 100).toFixed(0);
</script>

<svelte:head><title>{c.title} — rsvelte Learn</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="One worker processes documents one after another. When the next document reuses the vector capacity that the previous syntax tree no longer needs, it almost never has to allocate to grow."
/>

<div class="prose-learn">
	<H2 id="idea" />
	<p>
		The syntax tree <code>SyntaxTree</code> of <code>rsvelte_typescript</code> keeps node kinds, flags, data, positions,
		and more in one vector per column. When you parse a document, each vector grows to the number of nodes and
		allocates again each time it grows. When the document ends, the tree is dropped, and the next document grows the
		vectors from 0 again.
	</p>
	<p>
		The <code>pool</code> module empties the vectors of a dropped tree, keeps them in thread-local storage, and gives
		them to the next tree. A tree borrows its buffers when it is created (<code>take</code>) and returns them in
		<code>Drop</code> (<code>give</code>).
	</p>

	<H2 id="take-give" />
</div>

<Code item={data.code.take} />
<Code item={data.code.give} />

<div class="prose-learn">
	<p>
		Both call <code>take_at</code> and <code>give_at</code>. The only difference is the key that picks where a buffer is
		stored. For each key (a <code>TypeIdentifier</code>), the pool holds a list of raw pointers, capacities, and
		<code>Layout</code> values. It also holds the total number of bytes it keeps.
	</p>
</div>

<Code item={data.code.pool} />
<Code item={data.code.takeAt} />

<div class="prose-learn">
	<p>
		<code>take_at</code> rebuilds the buffer as a vector of length 0 with <code>Vec::from_raw_parts</code>. A vector of
		length 0 never reads its contents, so this is safe as long as the element type is right. The key makes sure the type
		is right. The key is the <code>TypeIdentifier</code> of a marker type: <code>Plain&lt;T&gt;</code>, which wraps
		<code>T</code>, or <code>Keyed&lt;K, T&gt;</code>, which wraps <code>K</code> and <code>T</code>. Under either key,
		only buffers that came from a <code>Vec&lt;T&gt;</code> are stored.
	</p>
</div>

<PoolViz />

<div class="prose-learn">
	<H2 id="keyed" />
	<p>
		The earlier pool used only the element type as the key. Then separate structures with columns of the same element
		type took buffers from the same storage. For example, the <code>buffer</code> of the <code>Interner</code>, which
		stores the names of a document, and the output buffer of the formatter are both <code>u8</code> buffers. When one of
		them returned a large buffer, the other one received it for the next document, grew it further, and returned it.
		Each one grew the other to its own size. So adding one of them to the pool showed up as a change that made the
		other one slower or gave worse results.
	</p>
	<p>
		To fix this, we added <code>take_keyed::&lt;K, T&gt;</code> and <code>give_keyed</code>, which include the owner's
		type in the key. <code>K</code> is the structure itself (<code>SyntaxTree</code>,
		<Term name="LayoutInstructions" />, <code>Component</code>, or <code>Interner</code>). Only columns of the same type
		in the same owner share storage. <code>String</code> buffers go through the <code>u8</code> storage with
		<code>take_string</code> and <code>give_string</code>.
	</p>
</div>

<Code item={data.code.takeKeyed} />
<Code item={data.code.giveKeyed} />
<Code item={data.code.takeString} />

<div class="prose-learn">
	<p>
		One owner can also have several columns of the same type. In <code>SyntaxTree</code>, both <code>extra</code> and
		the parser's working stack <code>scratch</code> are <code>Vec&lt;NodeIdentifier&gt;</code>. The storage is last in,
		first out. So if the owner returns the buffers in the reverse order of borrowing, each column gets a buffer of its
		own size again for the next document.
	</p>
</div>

<Code item={data.code.syntaxTreeDrop} />
<Code item={data.code.keyedTest} />

<div class="prose-learn">
	<p>
		With storage split by owner, the syntax tree, the formatting data, the component, and the name table each reuse their
		own storage. The number of memory allocations in 1 run went down from 2,667,581 to 2,488,731 (−6.7%). The allocated
		bytes went down from 205,928,932 to 188,999,498. No measured value went up (20f5846343).
	</p>

	<H2 id="limits" />
	<p>
		The pool has two limits on what it holds. One storage slot holds at most <code>MAXIMUM_PER_KEY</code> buffers. The
		whole pool of a thread holds at most <code>MAXIMUM_BYTES</code> (64 mebibytes). A buffer that would go over either
		limit is not stored; it is freed in the normal way.
	</p>
</div>

<Code item={data.code.perKey} />
<Code item={data.code.maxBytes} />
<Code item={data.code.giveAt} mark={['if p.bytes + layout.size() > MAXIMUM_BYTES {', 'let room = slot.len() < MAXIMUM_PER_KEY;']} />

<div class="prose-learn">
	<p>
		The byte budget was added later. Without it, the buffers of one very large document stay in the pool for the rest of
		the run. This is not a problem for a command line program that runs once. In a long-running process such as a
		language server, however, the peak memory never goes down.
	</p>
	<p>
		The budget never takes effect on the set of source files used for checks. With the budget in place, not one
		allocation count changed. A control confirms that the budget is really on the code path: when the budget shrinks to
		64 kibibytes, the allocations in 1 round go up from 2,021,660 to 2,547,339. The cost is the bookkeeping: +0.22%
		instructions (2,749,769,496 → 2,755,832,077), all inside <code>take</code> and <code>give</code>. We also tried
		borrowing and returning all buffers of one structure in a single borrow. It cost +0.26% and did not win the cost
		back, so the pool keeps one call per buffer (e8eef831d3).
	</p>
</div>

<Code item={data.code.budgetTest} />

<div class="prose-learn">
	<p>
		<code>take</code> hands out the vector that was returned last, whatever its capacity (last in, first out). Look at
		the first <code>take</code> of document 3 (300 nodes) in the figure. It receives the small vector that the previous
		document used for parsing, and grows it again<Note
			>The pool does not hand out the largest buffer first, and it does not pick the one closest to the needed size.
			Which of these helps is a decision to make after measuring.</Note
		>. Press the budget button in the figure to see buffers over the budget being freed and the next document growing
		its vector again.
	</p>
	<p>When a thread ends, the pool frees the vectors that are left, using their <code>Layout</code>.</p>
</div>

<Code item={data.code.drop} />

<div class="prose-learn">
	<p>
		The pool is thread-local, so it helps only while the worker stays the same. The default threads of rayon stay alive
		across runs. For a run with <code>RunOptions::threads</code>, <code>in_pool</code> also keeps one thread pool, for
		the last thread count used, for the life of the process. Consecutive runs with the same thread count reuse the same
		threads and the capacity those threads saved (Chapter <a href="/en/learn/kernel/pipeline#run">06</a>).
	</p>

	<H2 id="users" />
	<p>These are the main structures that use the pool:</p>
	<ul>
		<li>
			<code>rsvelte_typescript::SyntaxTree</code>: the columns, strings, comments, and type tables of the syntax tree,
			and the parser's working stack (Chapter <a href="/en/learn/polish#history">14</a>).
		</li>
		<li>
			<code>Tokens&lt;K&gt;</code>: the token table (Chapter <a href="/en/learn/kernel/layers#tokens">05</a>). Its key
			is only the element type <code>Token&lt;K&gt;</code>.
		</li>
		<li><code>rsvelte_svelte::syntax::syntax_tree::Component</code>: the template columns.</li>
		<li>
			<Term name="LayoutInstructions" />: the arena of the formatting data structure (Chapter
			<a href="/en/learn/kernel/document#ir">08</a>), and the printer's stacks and work lists.
		</li>
		<li>
			<code>Interner</code>: the name strings, their end offsets, and the hash table (Chapter
			<a href="/en/learn/kernel/interning#growth">03</a>).
		</li>
	</ul>
	<p>
		The storage for results computed per document, the line index, the structured data writer, the Svelte parser, the
		style sheet analysis, and the syntax tree for type checking also use the pool.
	</p>
</div>

<Code item={data.code.tokensDefault} />
<Code item={data.code.componentDrop} />

<div class="prose-learn">
	<p>
		Before this, each document allocated its token storage and then dropped it. The capacity was 1/4 of the source
		length. For 32 megabytes of source, the parse task <code>svelte.parse</code> allocated 253 megabytes in 1 round.
		Moving this storage into the pool changed the allocated bytes in 1 round from 385,305,807 to 210,562,915 (−45%)
		(92571ee562).
	</p>

	<H2 id="measure" />
	<p>
		With <code>set_enabled(false)</code>, <code>take</code> always returns an empty vector, and <code>give</code> does
		nothing. This switch exists only to measure the effect of the pool.
	</p>
</div>

<Code item={data.code.setEnabled} />

<div class="prose-learn">
	<p>
		The <code>nopool</code> arm of the benchmark uses this switch. On build <code>{data.benchRev.slice(0, 10)}</code>,
		with {data.docs.toLocaleString('en-US')}
		documents, turning the pool off raised the median from {data.shared.plain[0].toFixed(1)} milliseconds to {data.nopool.plain[0].toFixed(1)} milliseconds,
		and the allocations from {(data.shared.allocations / 1e6).toFixed(2)} million to {(data.nopool.allocations / 1e6).toFixed(2)} million.
		So the pool saves about {pct(
			data.shared.plain[0],
			data.nopool.plain[0]
		)}% of the time and about {pct(data.shared.allocations, data.nopool.allocations)}% of the allocations.
	</p>
	<DeepDive title="Why this comparison is old">
		<p>
			This comparison was measured on a build after the keys were split by owner (d6f426e250), which is older than the
			current code. The effects of later changes are measured with the counts of the checks against performance
			baselines (1 thread, last round), as written above. Those counts are a different quantity from the benchmark's
			running time (Chapter <a href="/en/learn/measure#ratchet">13</a>).
		</p>
	</DeepDive>
</div>

<Code item={data.code.test} />

<ChapterFooter chapter={c} />
