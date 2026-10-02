import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p></p>`);

export default function Foo($$anchor) {
	let internal = 1;
	var p = root();

	p.textContent = 'internal: 1';
	$.append($$anchor, p);
}