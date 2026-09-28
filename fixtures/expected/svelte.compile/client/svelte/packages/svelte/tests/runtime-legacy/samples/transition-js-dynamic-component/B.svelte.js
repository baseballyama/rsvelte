import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>b</div>`);

export default function B($$anchor) {
	function b(node, params) {
		return {
			duration: 100,
			tick: (t) => {
				node.b = t;
			}
		};
	}

	var div = root();

	$.transition(3, div, () => b);
	$.append($$anchor, div);
}