import * as $ from 'svelte/internal/server';

export default function Output($$renderer) {
	function is() {}
	function where() {}
	function not() {}
	function has() {}

	// looks like css but it's not in style tag
	const x = { div: is(42), span: where(42), form: not(42), input: has(42) };

	$$renderer.push(`<!---->what if i'm talking about \`:has()\` in my blog?

\`\`\`css
	:has(.is_cool)
\`\`\``);
}