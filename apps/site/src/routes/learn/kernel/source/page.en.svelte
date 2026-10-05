<script lang="ts">
	import Term from '$lib/components/Term.svelte';
	import ChapterFooter from '$lib/components/ChapterFooter.svelte';
	import ChapterHeader from '$lib/components/ChapterHeader.svelte';
	import Code from '$lib/components/Code.svelte';
	import DeepDive from '$lib/components/DeepDive.svelte';
	import H2 from '$lib/components/H2.svelte';
	import Note from '$lib/components/Note.svelte';
	import { chapter } from '$lib/site';
	import LineIndexExplorer from '$lib/widgets/LineIndexExplorer.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const c = chapter('source', 'en');
</script>

<svelte:head><title>{c.title} — rsvelte Learn</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="Syntax tree nodes, diagnostics, position mappings, and lint findings: almost everything that moves through the kernel has a position. This chapter shows how a position is stored, and how it is converted to the line and column that JavaScript tools expect."
/>

<div class="prose-learn">
	<H2 id="span" />
	<p>
		A position is a <dfn>Span</dfn>: a half-open range of bytes in one document, in UTF-8 (the 8-bit Unicode encoding). It holds only
		two <code>u32</code> values, so its size is 8 bytes.
	</p>
</div>

<Code item={data.code.span} />

<div class="prose-learn">
	<p>
		A Span does not hold a file identifier. A syntax tree has tens of thousands of nodes, so even 4 more bytes per node add up. And the
		document that a position belongs to is always known from the context: <Term name="DocumentContext" /> belongs to only one document,
		and a task also runs on one document.
	</p>
	<p>
		<code>Span::new</code> checks <code>start_offset &lt;= end_offset</code> and the upper limit, but with <code>debug_assert!</code>, so a
		release build checks nothing. The parser makes Spans from the text that it reads, so this is the most frequent path, and even one
		comparison adds up. Positions that come from outside (the reports of <code>tsc</code>) are checked by the code that parses them,
		before it makes a Span<Note
			>If you call <code>Span::text</code> with a Span outside the text, the bounds check of the slice panics, also in a release build.
			So the error is not silent, but the program stops where the bad value is used, not where it was made.</Note
		>.
	</p>
</div>

<Code item={data.code.spanNew} />

<div class="prose-learn">
	<H2 id="loc" />
	<p>
		During a transform, some new nodes match no place in the source, such as the <code>$.get(...)</code> calls that the compiler adds.
		If such a node had a fake Span, position mappings and error positions would be wrong without any warning. So the position of a node
		uses a separate type that records <dfn>whether a position exists in the source</dfn>.
	</p>
</div>

<Code item={data.code.location} />
<Code item={data.code.synthetic} />

<div class="prose-learn">
	<p>
		The type for <Term name="SourceLocation" /> is also 8 bytes. It marks a node as synthetic by setting both ends to
		<code>u32::MAX</code>, a value that a real Span cannot have. Because of this, the length of a source needs an upper limit.
	</p>
</div>

<Code item={data.code.max} />

<div class="prose-learn">
	<p>
		The limit is checked in only one place: where text enters the pipeline. <code>Document::new</code> checks the length and returns
		<code>TooLarge</code> when the text is too long. <code>Document</code> is <code>#[non_exhaustive]</code>, so code outside the crate
		cannot make one without this function.
	</p>
</div>

<Code item={data.code.docNew} mark={['MAXIMUM_SOURCE_LENGTH']} />

<div class="prose-learn">
	<p>
		To get a <code>Span</code> from the type for <Term name="SourceLocation" />, the only way is <Term name="SourceLocation::span" />, and
		it returns an <code>Option</code>. You cannot get a position until you handle the case of a synthetic node.
	</p>
</div>

<Code item={data.code.locationSpan} />

<div class="prose-learn">
	<H2 id="line-index" />
	<p>
		Inside the kernel, positions are bytes. They are converted to lines and columns when an output format needs them. For example, lint
		diagnostics and source maps give positions as lines and columns. And the column that JavaScript tools count is neither bytes nor
		characters. It is a number of <strong>UTF-16 (the 16-bit Unicode encoding) code units</strong>.
	</p>
	<p>
		<dfn>LineIndex</dfn> does this conversion. It is built only once per document, and <Term name="DocumentContext::line_index" /> caches
		it.
	</p>
</div>

<Code item={data.code.lineIndex} />
<Code item={data.code.lineCol} />

<LineIndexExplorer />

<div class="prose-learn">
	<p>
		<code>line_starts</code> holds the byte position where each line starts. To find the line of a byte position, a binary search on this
		array is enough.
	</p>
	<p>
		Columns need one more table. For each character that is not ASCII (the basic set of letters, digits, and symbols), <code>wide</code>
		lists its byte range (start and end) and the UTF-16 position of its start. In a document with only ASCII characters, this table stays
		empty. In ASCII, 1 byte is 1 UTF-16 unit, so the byte position is already the answer. Of the 19,503 documents in
		<code>fixtures/svelte</code>, 18,419 (94%) contain only ASCII and take this shortcut<Note
			>We read the <code>input.svelte</code> of each test case at 7a09c5b1f1 and counted the files whose bytes are all below 0x80.</Note
		>.
	</p>
</div>

<Code item={data.code.wide} />
<Code item={data.code.indexNew} mark={['is_ascii']} />

<div class="prose-learn">
	<p>
		The index does not hold the text. It answers every query with three tables and the length of the document. The tables are the line
		starts, the lines that end with a two-character line break (<code>\r\n</code>), and <code>wide</code>. Before, <code>utf16</code>
		took the text and decoded the character just before the position, so a caller could pass the wrong text by mistake. Now a caller
		cannot pass text at all (91fec70a6d).
	</p>
</div>

<div class="prose-learn">
	<H2 id="utf16" />
	<p>
		<code>utf16(byte)</code> finds, with a binary search on <code>wide</code>, the last non-ASCII character that ends before
		<code>byte</code>. Only ASCII follows that character, so the function adds the difference. If <code>byte</code> points inside a
		multi-byte character, it returns the position of the start of that character. If <code>byte</code> is past the end of the document, it
		returns the position of the end.
	</p>
</div>

<Code item={data.code.utf16} />

<div class="prose-learn">
	<p>
		The old <code>utf16</code> decoded the character just before the position and subtracted its length. For a position inside a
		multi-byte character, the subtraction overflowed: a debug build panicked, and a release build gave a huge column
		(<code>utf16("é", 1)</code>). The calculation in <code>Emitter::lookup</code> could reach this path, so we rewrote the function to
		answer from the tables only. The test walks a mixed text from the start. It checks that every boundary matches the result of the walk,
		and that the conversion back gives the same position. The cost of the rewrite is a larger table: the entry for 1 non-ASCII character
		grew from 8 bytes to 12 bytes, and the bytes allocated in 1 round grew by 11,808. The number of allocations and the number of
		instructions did not change (91fec70a6d).
	</p>
</div>

<Code item={data.code.roundTest} />

<div class="prose-learn">
	<p>
		Choose “Rust test” in the figure to get the same input as the kernel test, <code>a😀b\nc</code>. The emoji 😀 is 4 bytes in UTF-8,
		and 2 units (a surrogate pair) in UTF-16. So <code>b</code> is at byte 5, but its column is 3.
	</p>

	<DeepDive title="Why UTF-16 units and not characters">
		<p>
			JavaScript strings are UTF-16, and <code>"😀".length</code> is 2. The <code>column</code> of ESLint, the <code>character</code> of
			TypeScript, and the columns of source maps all count in this unit. If you count Rust <code>char</code> values (Unicode scalar
			values), positions differ from upstream on lines that contain emoji or some Han characters (Chinese, Japanese, and Korean unified
			ideographs, Extension B and later).
		</p>
		<p>
			Today, the lint output counts columns from 1 (<code>column + 1</code>), and the type check output counts them from 0. Both come from
			the <code>column</code> of <code>LineColumn</code>.
		</p>
	</DeepDive>

	<H2 id="offset" />
	<p>
		The reverse, <code>offset(line, column)</code>, is also a binary search on the table. It adds the column to the UTF-16 position of
		the line start to get the target position. Then it starts from the last non-ASCII character that ends before that position, and moves
		forward by the number of ASCII bytes.
	</p>
</div>

<Code item={data.code.offset} />

<div class="prose-learn">
	<p>
		A column is accepted up to the end of the line (just before the line break). For a column past that, and for a column inside a
		surrogate pair, the function returns <code>None</code>. If it rounded to a nearby position that exists, the caller could not tell
		whether the position existed. To see this in the figure, enter a large column for line 1 in the bottom row.
	</p>
	<p>
		Only one caller depended on rounding: the parser of <code>tsc</code> reports. <code>tsc</code> draws one <code>~</code> even for a
		range of width 0, so for a diagnostic at the end of a line, the end is one column past the end of the line. The parser handles only
		that one case, and a comment in its code gives the reason.
	</p>
</div>

<Code item={data.code.reportEnd} mark={['(end_line, end_column) == (ln, column)']} />

<ChapterFooter chapter={c} />
