import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1></h1> <p></p>`, 1);

export default function _2_input($$anchor) {
	var fragment = root();
	var h1 = $.first_child(fragment);

	h1.textContent = `Hello ${name ?? ''}!`;

	var p = $.sibling(h1, 2);

	p.textContent = `${a ?? ''} + ${b ?? ''} = ${a + b}.`;
	$.append($$anchor, fragment);
}