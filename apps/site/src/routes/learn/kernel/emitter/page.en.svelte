<script lang="ts">
	import Term from '$lib/components/Term.svelte';
	import ChapterFooter from '$lib/components/ChapterFooter.svelte';
	import ChapterHeader from '$lib/components/ChapterHeader.svelte';
	import Code from '$lib/components/Code.svelte';
	import H2 from '$lib/components/H2.svelte';
	import Note from '$lib/components/Note.svelte';
	import { chapter } from '$lib/site';
	import EmitCompare from '$lib/widgets/EmitCompare.svelte';
	import SpanFigure from '$lib/widgets/SpanFigure.svelte';
	import VlqEncoder from '$lib/widgets/VlqEncoder.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const c = chapter('emit', 'en');
</script>

<svelte:head><title>{c.title} — rsvelte Learn</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="When you generate code, positions in the output no longer match positions in the source. To report a problem found in the output at its place in the source, the Emitter builds a table of position mappings together with the output text. It works for any output language."
/>

<div class="prose-learn">
	<H2 id="emitter" />
	<p>An Emitter holds only the output text and a list of <dfn>Mapping</dfn> values.</p>
</div>

<Code item={data.code.emitter} />
<Code item={data.code.mapping} />

<div class="prose-learn">
	<p>There are two kinds of Mapping:</p>
	<ul>
		<li>
			<strong>Copy</strong> (<code>len &gt; 0</code>): a range that copies <code>len</code> bytes of the source text
			unchanged. Positions inside it map 1:1. <code>copy</code> creates it.
		</li>
		<li>
			<strong>Point</strong> (<code>len == 0</code>): a mark that says "this generated position stands for this source
			position". <code>mark</code> and <code>push_for</code> create it. It is used for renamed identifiers and for calls
			that the compiler adds.
		</li>
	</ul>
</div>

<Code item={data.code.copy} />
<Code item={data.code.mark} />
<Code item={data.code.pushFor} />

<div class="prose-learn">
	<p>
		<code>push_for</code> receives an <Term name="SourceLocation" />. For a node that the compiler made up,
		it adds no mark (Chapter <a href="/en/learn/kernel/source#loc">02</a>). This keeps made-up positions out of the
		position mappings.
	</p>
	<p>
		The next figure shows JavaScript that the Svelte plugin really produced, with its position mappings. It is the same
		figure as on the home page.
	</p>
</div>

<SpanFigure data={data.counter} label="Figure 9.0 · The real output of Counter.svelte" />

<div class="prose-learn">
	<p>
		This output has only {data.counter.mappings.length} position mappings so far, and all of them are points<Note
			><code>crates/hosts/command_line/tools/export_site_source_maps.rs</code> generates the output and its position
			mappings, and they are committed as site data. The compile task itself does not write position mappings to a file
			yet.</Note
		>. When the official Svelte 5.57.1 compiler compiles the same input, its source map has 28 segments<Note
			>We counted the entries that describe position mappings in the official compiler's output. The rsvelte
			<code>source_map</code> writes one segment for each copied character and one for each point. This output has no
			copies and 6 points, so it has 6 segments.</Note
		>. A character with no mapping is attributed to the nearest mapping point before it on the same line.
	</p>

	<H2 id="lookup" />
	<p>
		The reverse lookup, from a generated position to a source position, is <code>lookup</code>. It uses the same rule
		as a reader of a per-character source map: the <dfn>greatest lower bound</dfn>. That is, it finds the last mapping
		point at or before the position on the same generated line.
	</p>
</div>

<Code item={data.code.lookup} mark={['(!between.contains(']} />

<div class="prose-learn">
	<p>
		If the Mapping it finds is a copy and the position is inside it, the position maps 1:1. If the position is after the
		copy (inside inserted text), it returns the start of the last copied character. For a point Mapping, it returns the
		point. In both cases, it returns <code>None</code> when a line break comes between the point and the position. Source
		map readers do not search across lines, so <code>lookup</code> does the same.
	</p>

	<H2 id="lookup-span" />
	<p>A diagnostic has a range, so <code>lookup</code> maps both ends.</p>
</div>

<Code item={data.code.lookupSpan} />

<div class="prose-learn">
	<p>
		This has one subtle problem. The end of a half-open range is the "next position", so it often falls right after a
		copy, in inserted text. <code>lookup</code> maps it to the position of the last copied character, so the result is
		1 character shorter than the original range.
	</p>
	<p>
		We keep this on purpose, because svelte-check behaves the same way. svelte-check also maps the end to "the source
		position of the character at the generated end position". The goal is to match the upstream output. When a producer
		wants exact ends, it places a <code>mark</code> right after the copy. The test checks both cases.
	</p>
</div>

<Code item={data.code.spansTest} mark={['Some(Span::new(3, 12))', 'marked.mark(16);', 'Some(Span::new(15, 16))']} />

<div class="prose-learn">
	<p>
		There is more than one way to map a range. Volar, the upstream that vue-tsc uses for Vue type checking, does not map
		the two ends separately. It collects only the <strong>copied characters</strong> inside the range and returns their
		source range. Inserted text maps to nothing. A diagnostic on the generated range <code>__VLS_context.x</code> maps
		only to the source <code>x</code>. The kernel also has this rule, as <code>lookup_overlap</code>.
	</p>
</div>

<Code item={data.code.lookupOverlap} />

<div class="prose-learn">
	<p>
		The type check task does not know which rule it uses. When a language passes the TypeScript code that it generates
		for type checking, it also passes the mapping function (Chapter <a href="/en/learn/kernel/database#facet">04</a>).
		Vue passes <code>lookup_overlap</code>. Svelte passes <code>lookup_span</code>, but it does not use this function:
		Svelte uses the TypeScript content mapper, so tsc reports source positions from the start.
	</p>
</div>

<Code item={data.code.mapBack} />

<div class="prose-learn">
	<p>
		For a language that does not use the content mapper, this function maps the positions that tsc reports back to the
		source. A diagnostic that does not map (one inside generated code) is dropped. svelte-check also drops a diagnostic
		when its mapped range has a negative line (<code>hasNoNegativeLines</code>).
	</p>
</div>

<Code item={data.code.checkProjected} mark={['(d.map_back)(&d.projection, f.span)']} />

<div class="prose-learn">
	<H2 id="source-map" />
	<p>
		<code>source_map</code> writes the position mappings as a source map version 3 document in JSON (JavaScript Object
		Notation). First, it expands each Mapping into mapping points: one point for each character of a copy, and one
		point for a point Mapping. When two points have the same generated position, the later one wins (as in
		<code>lookup</code>). Then it writes the points in generated order, separates lines with <code>;</code>, and writes
		each point as four differences: generated column, source index, source line, and source column.
	</p>
</div>

<Code item={data.code.points} />
<Code item={data.code.sourceMap} />

<div class="prose-learn">
	<p>
		Each difference is written as a <dfn>variable-length integer</dfn> in base64. The sign moves to the lowest bit. The
		value is then taken 5 bits at a time from the low end, and the 6th bit is set when more digits follow.
	</p>
</div>

<VlqEncoder />
<Code item={data.code.vlq} />

<div class="prose-learn">
	<H2 id="disagreement" />
	<p>
		Diagnostics inside the kernel are mapped with <code>lookup</code>. External tools (debuggers, browsers, and other
		language tools) read the written source map. If the two answers differ, the same Emitter has two different truths.
	</p>
	<p>
		The source map format cannot describe a 1:1 range with one segment. To describe the inside of a copy correctly, it
		must write a segment for each character. This is also why magic-string writes one segment per character with
		<code>hires: true</code>. Switch the figure to "Per Mapping" to see how the inside of a copy maps when only one
		segment is written.
	</p>
</div>

<EmitCompare />

<div class="prose-learn">
	<p>
		We could make <code>lookup</code> as coarse as the source map instead, but then type check positions would differ
		from svelte-check. So the writer is made finer. A test decodes the source map and checks that the two answers agree
		at every position of the output.
	</p>

	<H2 id="edits" />
	<p>
		For some tasks, it is more natural to apply small edits to the source text than to print the whole output again.
		<dfn>Edits</dfn> collects insertions and replacements and applies them in one pass.
	</p>
</div>

<Code item={data.code.edits} />
<Code item={data.code.applyIn} mark={['range.start_offset <= *start_offset', '*start_offset >= checked_to']} />

<div class="prose-learn">
	<p>
		Release builds also check that no two edits overlap and that no edit is outside the range. Without these checks,
		overlapping edits would show up much later as a panic in a slice (<code>&source_text[position..start_offset]</code>),
		far from the cause. The cost is two checks for each edit (four comparisons).
	</p>
	<p>
		The order of the two checks also matters. An earlier version checked for overlap first, so an edit before the range
		was reported as "overlapping". Now the range check comes first, and the edit is correctly reported as "outside the
		range" (37a595c11e).
	</p>
</div>

<ChapterFooter chapter={c} />
