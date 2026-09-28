import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><!></div>`);

export default function Child($$anchor, $$props) {
	function foo(node, params) {
		return {
			delay: 50,
			duration: 100,
			tick: (t) => {
				node.foo = t;
			}
		};
	}

	var div = root();
	var node_1 = $.child(div);

	$.slot(node_1, $$props, 'default', {}, null);
	$.reset(div);
	$.transition(3, div, () => foo);
	$.append($$anchor, div);
}