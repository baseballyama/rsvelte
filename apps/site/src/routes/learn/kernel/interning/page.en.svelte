<script lang="ts">
	import ChapterFooter from '$lib/components/ChapterFooter.svelte';
	import ChapterHeader from '$lib/components/ChapterHeader.svelte';
	import Code from '$lib/components/Code.svelte';
	import H2 from '$lib/components/H2.svelte';
	import Note from '$lib/components/Note.svelte';
	import { chapter } from '$lib/site';
	import InternerViz from '$lib/widgets/InternerViz.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const c = chapter('intern', 'en');
</script>

<svelte:head><title>{c.title} — rsvelte Learn</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="Each identifier name is replaced by a small integer, an Atom. Comparing or hashing a name then takes one integer, and no string is allocated for each name."
/>

<div class="prose-learn">
	<H2 id="why" />
	<p>
		Scope analysis asks "Which declaration does this name refer to?" many times. If names stay as <code>String</code>,
		every comparison compares strings, and every node allocates a string. With interning, the same name always becomes the same <dfn>Atom</dfn> (a
		<code>u32</code> inside), so a comparison is an integer comparison.
	</p>
	<p>
		The kernel only provides the Interner. The languages use it. Today the <code>SyntaxTree</code> of <code>rsvelte_typescript</code> and the <code>SyntaxTree</code> of <code>rsvelte_stylesheet</code>
		each hold one. Scope analysis looks up bindings with <code>(ScopeIdentifier, Atom)</code> as the key<Note
			>Each document gets its own Interner. You cannot compare Atoms from different documents, and nothing needs to.</Note
		>.
	</p>

	<H2 id="layout" />
	<p>
		An Interner holds only three buffers. The characters of all names are joined into one <code>buffer</code>, and <code>ends</code>
		records where each name ends. The string of Atom <var>n</var> runs from <code>ends[n-1]</code> to <code>ends[n]</code>.
	</p>
</div>

<Code item={data.code.interner} />
<Code item={data.code.get} />

<div class="prose-learn">
	<p>
		Adding a new name only adds to the end of two buffers. Both double their capacity when they grow, so the amortized number of allocations for each name is constant, and no
		<code>String</code> is created for each name.
	</p>

	<H2 id="table" />
	<p>
		To find the Atom for a name, the Interner uses an open addressing hash table. Each array position in <code>table</code> holds "the Atom number +
		1", and 0 marks an empty position. The low bits of the hash pick the array position. If that position is taken, the search moves to the next array position (linear probing).
	</p>
</div>

<Code item={data.code.probe} mark={['_ => i = (i + 1) & mask']} />
<Code item={data.code.intern} mark={['Ok(atom) => return atom,', '(self.ends.len() + 1) * 2 > self.table.len()']} />

<InternerViz />

<div class="prose-learn">
	<p>
		All searching happens in one function, <code>probe</code>. It returns the Atom if the name is found, or the empty array position where the name should go. <code>lookup</code>
		uses the same search without inserting. If the table does not exist yet, it returns <code>None</code> without searching.
	</p>
</div>

<Code item={data.code.lookup} />

<div class="prose-learn">
	<H2 id="growth" />
	<p>
		When the number of names is about to pass half of the table capacity, the capacity doubles and every name is inserted again. The first capacity is 64. The load factor stays at 0.5
		or below, so linear probing sequences stay short. Press "+20" in the figure two times, and you see the capacity grow to 128 when name 33 is added.</p>
	<p>
		The growth check runs only when the search does not find the name (when it reaches an empty array position). Only a new name raises the load factor, so looking up an existing name never makes the table larger. After the table grows, the search for an empty
		array position runs again in the new table.
	</p>
</div>

<Code item={data.code.grow} mark={['self.table.clear();', 'self.table.resize(cap, 0);']} />

<div class="prose-learn">
	<p>
		The strings do not move when the names are inserted again. <code>buffer</code> and <code>ends</code> stay as they are, and only <code>table</code>
		changes. Atom numbers do not change either, so Atoms that were already handed out stay valid. The table does not get a new vector. The same vector is emptied and then filled with
		0 up to the needed length. If its capacity is large enough, no allocation happens here.
	</p>
	<p>
		The three buffers are also reused across documents. When an Interner is created, it borrows buffers from the thread's buffer pool under the key <code>Interner</code>,
		and it gives them back when it is dropped (Chapter <a href="/en/learn/kernel/buffer-pool#keyed">12</a>). It gives them back in the reverse order of borrowing. <code>ends</code> and
		<code>table</code> are both <code>Vec&lt;u32&gt;</code>, so in any other order, the next document would get each other's buffers.
	</p>
</div>

<Code item={data.code.pooled} />
<Code item={data.code.drop} />

<div class="prose-learn">
	<p>
		The old pool separated buffers only by element type. So the Interner's <code>buffer</code> (a buffer of <code>u8</code>) and the formatter's output buffer were stored in the same place, and each grew to the other's size. This is why putting either of them into the pool showed up as a change that made the other's performance or results worse. We gave each owner its own key and made the Interner
		reuse its buffers too. The number of memory allocations in 1 run fell from 2,667,581 to 2,488,731 (−6.7%).
		The instruction count went from 3,012,227,617 to 2,960,233,041 (−1.7%, 20f5846343).
	</p>
</div>

<ChapterFooter chapter={c} />
