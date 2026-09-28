import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Nested from './Nested.svelte';
import Leaf from './Leaf.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function Main($$anchor) {
	Nested($$anchor, {
		name: 'foo',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Nested(node, {
				name: 'bar',
				children: ($$anchor, $$slotProps) => {
					Leaf($$anchor, {});
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Nested(node_1, {
				name: 'baz',
				children: ($$anchor, $$slotProps) => {
					Leaf($$anchor, {});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}