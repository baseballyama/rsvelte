import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>+1</button> <!>`, 1);

export default function Nested($$anchor, $$props) {
	let count = 0;
	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	$.slot(
		node,
		$$props,
		'main',
		{
			get c() {
				return count;
			}
		},
		null
	);

	$.event('click', button, () => count += 1);
	$.append($$anchor, fragment);
}