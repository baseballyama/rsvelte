import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import C from './C.svelte';

var root = $.from_html(`<span>Hello World</span>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	C(node, { foo: 'bar' });

	var node_1 = $.sibling(node, 2);

	C(node_1, {
		foo: 'bar',
		children: ($$anchor, $$slotProps) => {
			var span = root();

			$.append($$anchor, span);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}