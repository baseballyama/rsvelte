import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>Hello</h1>`);

export default function Input($$anchor) {
	var h1 = root();

	$.action(h1, ($$node) => blink?.($$node));
	$.append($$anchor, h1);
}