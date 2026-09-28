import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>foo</p>`);

export default function Foo($$anchor) {
	function fade(_) {
		return { duration: 100, css: (t) => `opacity: ${t}` };
	}

	var p = root();

	$.transition(3, p, () => fade);
	$.append($$anchor, p);
}