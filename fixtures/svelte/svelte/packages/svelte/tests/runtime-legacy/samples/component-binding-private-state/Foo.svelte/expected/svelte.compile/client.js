import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p></p>`);

export default function Foo($$anchor) {
	let x = 'yes';
	var p = root();

	p.textContent = 'Foo: yes';
	$.append($$anchor, p);
}