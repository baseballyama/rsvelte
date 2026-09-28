import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button><!></button> <!>`, 1);

export default function Counter($$anchor, $$props) {
	let count = $.state(0);

	function increment() {
		$.set(count, $.get(count) + 1);
	}

	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.child(button);

	$.slot(
		node,
		$$props,
		'default',
		{
			get count() {
				return $.get(count);
			}
		},
		null
	);

	$.reset(button);

	var node_1 = $.sibling(button, 2);

	$.slot(node_1, $$props, 'named', {}, null);
	$.event('click', button, increment);
	$.append($$anchor, fragment);
}