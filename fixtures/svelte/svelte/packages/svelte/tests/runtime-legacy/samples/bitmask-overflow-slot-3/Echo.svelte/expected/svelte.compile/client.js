import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <button></button>`, 1);

export default function Echo($$anchor, $$props) {
	let dummy = 0;

	function increment() {
		dummy = 1;
	}

	var fragment = root();
	var node = $.first_child(fragment);

	$.slot(
		node,
		$$props,
		'default',
		{
			get dummy() {
				return dummy;
			}
		},
		null
	);

	var button = $.sibling(node, 2);

	$.event('click', button, increment);
	$.append($$anchor, fragment);
}