import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function Widget($$anchor) {
	function foo(node, params) {
		return {
			duration: 100,
			tick: (t) => {
				node.foo = t;
			}
		};
	}

	var div = root();

	$.transition(3, div, () => foo);
	$.append($$anchor, div);
}