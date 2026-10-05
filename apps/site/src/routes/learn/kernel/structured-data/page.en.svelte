<script lang="ts">
	import ChapterFooter from '$lib/components/ChapterFooter.svelte';
	import ChapterHeader from '$lib/components/ChapterHeader.svelte';
	import Code from '$lib/components/Code.svelte';
	import H2 from '$lib/components/H2.svelte';
	import Note from '$lib/components/Note.svelte';
	import { chapter } from '$lib/site';
	import JsonStepper from '$lib/widgets/JsonStepper.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const c = chapter('json', 'en');
</script>

<svelte:head><title>{c.title} — rsvelte Learn</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="Lint results, type check results, and benchmark reports are all JSON (JavaScript Object Notation). The kernel writes JSON directly into a string, without building a tree of values."
/>

<div class="prose-learn">
	<H2 id="state" />
	<p>
		If you build a tree of values such as <code>serde_json::Value</code>, you allocate a string for every object key. The
		output is written once and then done, so a tree has no purpose<Note
			>The main branch stores syntax trees as generic structured data. In that implementation, allocating strings for
			object keys made up most of the memory allocations.</Note
		>. StructuredDataWriter only appends to a string, in the order it is called.
	</p>
	<p>It has only two pieces of state:</p>
	<ul>
		<li><code>stack</code>: one flag for each open object or array, which records "a member has already been written".</li>
		<li><code>after_key</code>: a mark that says a key was just written, so the next value belongs to that key.</li>
	</ul>
</div>

<Code item={data.code.writer} />

<div class="prose-learn">
	<p>
		Every value goes through <code>before_value</code> first. Right after a key, it does nothing. Otherwise, if the same
		container already has a member, it writes a comma. Then, in pretty mode, it starts a new line and indents with tabs.
	</p>
</div>

<Code item={data.code.beforeValue} />

<JsonStepper />

<div class="prose-learn">
	<p>
		When a container closes and it has at least one member, the writer starts a new line before the closing bracket (in
		pretty mode). An empty <code>{'{}'}</code> or <code>[]</code> stays on one line.
	</p>
</div>

<Code item={data.code.close} />
<Code item={data.code.key} />

<div class="prose-learn">
	<p>
		Numbers go through two functions. <code>write_number</code> accepts only integers (types that implement the
		<code>Integer</code> trait). A fraction goes through <code>fixed</code>, which takes the number of digits after the
		decimal point. JSON has no <code>NaN</code> and no infinity, so a value that is not finite becomes <code>null</code>.
	</p>
	<p>
		The old number function accepted any value that implemented <code>Display</code>. So a string or <code>NaN</code>
		could be written where a number belongs. In fact, the benchmark passed strings rounded with
		<code>format!("{'{:.3}'}", …)</code>, and wrote <code>NaN</code> when the population was empty. Separating the two
		by type made both mistakes impossible (37a595c11e).
	</p>
</div>

<Code item={data.code.integer} />
<Code item={data.code.num} />
<Code item={data.code.fixed} />

<div class="prose-learn">
	<H2 id="escape" />
	<p>
		<code>write_string</code> escapes strings. <code>"</code>, <code>\</code>, line feed, carriage return, and tab get
		their short forms. Other control characters become <code>\u00XX</code>. U+2028 and U+2029 are written as they are.
		They are valid in JSON, but they are a syntax error inside a string literal in older JavaScript.
	</p>
	<p>
		Characters that need no escape are not copied one by one. The writer copies everything up to the next escape in one
		step. Every byte that needs an escape is ASCII (American Standard Code for Information Interchange), so a run always ends on a character
		boundary. Compared with writing one character at a time, the instruction count went from 2,767,320,163 to
		2,749,769,496 (−0.6%). The checked output did not change (a6eed170c4).
	</p>
</div>

<Code item={data.code.writeString} />

<div class="prose-learn">
	<p>
		The test keeps the original one-character-at-a-time definition (<code>by_char</code>). It checks that the two
		outputs are equal for every ASCII character and for text that mixes escapes and multibyte characters.
	</p>
</div>

<Code item={data.code.escapeTest} />
<Code item={data.code.test} />

<ChapterFooter chapter={c} />
