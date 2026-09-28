import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	function is() {}
	function where() {}
	function not() {}
	function has() {}

	// looks like css but it's not in style tag
	const x = { div: is(42), span: where(42), form: not(42), input: has(42) };

	$.next();

	var text = $.text('what if i\'m talking about `:has()` in my blog?\n\n```css\n	:has(.is_cool)\n```');

	$.append($$anchor, text);
}