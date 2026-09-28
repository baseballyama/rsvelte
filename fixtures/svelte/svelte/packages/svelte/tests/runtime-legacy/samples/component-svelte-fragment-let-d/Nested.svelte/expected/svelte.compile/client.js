import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><!></div>`);

export default function Nested($$anchor, $$props) {
	let foo = 'a';
	var div = root();
	var node = $.child(div);

	$.slot(
		node,
		$$props,
		'main',
		{
			get foo() {
				return foo;
			}
		},
		null
	);

	$.reset(div);
	$.event('click', div, () => foo = 'b');
	$.append($$anchor, div);
}