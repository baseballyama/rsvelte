import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Nested from "./Nested.svelte";
import Leaf from "./Leaf.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Main($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Nested(node, {
		value: 'bar',
		children: ($$anchor, $$slotProps) => {
			Leaf($$anchor, {});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Nested(node_1, {
		children: ($$anchor, $$slotProps) => {
			Leaf($$anchor, {});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}