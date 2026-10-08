<script lang="ts">
	import DocumentPrinter from '$lib/widgets/DocumentPrinter.svelte';
	import { call, fill, flatOnly, groupIds, mustBeFlat, remeasure } from '../../kernel/document/presets';

	const object = {
		name: 'Object',
		width: 36,
		source: `group([
  "const props = {",
  indent([line, join([",", line], ["label: 'Click'", "count: 0", "disabled: false"])]),
  ifBreak(",", ""),
  line,
  "};"
])`
	};
	const fns = [
		['"text"', 'Text (an array is a concat)'],
		['line / softline', 'A space / nothing when flat; a newline when broken'],
		['hardline / literalline', 'Always a newline (literalline does not indent)'],
		['group(…) / groupBroken(…)', 'Flat if it fits / always broken'],
		['groupId("name", …)', 'A named group'],
		['indent(x) / dedent(x)', 'Add / remove one level of indentation'],
		['ifBreak(a, b)', 'a when the enclosing group breaks, b when it is flat'],
		['ifBreakOf("name", a, b)', 'Follows the named group'],
		['indentIfBreak("name", x)', 'Indents when the named group breaks'],
		['fill([content, separator, …])', 'Puts as many items on a line as fit'],
		['join(sep, [a, b, …])', 'Puts sep between the items'],
		['flatOnly(x)', 'Refused when it does not fit flat'],
		['breakParent', 'Makes the enclosing group break']
	];
</script>

<svelte:head><title>Try formatting decisions — rsvelte Learn</title></svelte:head>

<header class="mb-6">
	<span class="font-mono text-[13px] tracking-normal text-muted">Appendix</span>
	<h1 class="mt-1 text-[30px] leading-[1.3] font-semibold sm:text-[36px]" style="font-stretch: 92%">Try formatting decisions</h1>
	<a class="link mt-3 inline-block text-sm" href="/en/learn/playground">Back to the language plugin playground</a>
	<p class="mt-4 max-w-[44em] text-[17px] leading-[1.8] text-fg-2">
		Write the formatting data structure as small expressions. The Rust kernel runs in your browser as WebAssembly and prints the
		result. Chapter <a class="link" href="/en/learn/kernel/document">08</a> explains how it works. This page runs only in the browser;
		the server does not render it.
	</p>
</header>

<DocumentPrinter label="Playground" presets={[object, call, fill, groupIds, flatOnly, remeasure, mustBeFlat]} tall />

<section class="mt-10">
	<h2 class="text-[19px] font-semibold">Expressions you can use</h2>
	<table class="table mt-3">
		<tbody>
			{#each fns as [f, d] (f)}
				<tr><td class="w-[45%]"><code>{f}</code></td><td class="text-fg-2">{d}</td></tr>
			{/each}
		</tbody>
	</table>
</section>
