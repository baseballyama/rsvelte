import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Flex, Box } from '$lib/index.js';
import Plane from '../../Plane.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function Threlte($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Plane(node, { width: 500, height: 500, color: 'red' });

	var node_1 = $.sibling(node, 2);

	Flex(node_1, {
		width: 500,
		height: 500,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_2 = $.first_child(fragment_1);

			Box(node_2, {
				children: ($$anchor, $$slotProps) => {
					Plane($$anchor, { color: 'yellow', width: 100, height: 100, depth: 1 });
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Box(node_3, {
				flex: 1,
				children: ($$anchor, $$slotProps) => {
					Plane($$anchor, { color: 'blue', height: 100, depth: 1 });
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}