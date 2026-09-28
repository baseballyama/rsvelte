import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';
import { Studio } from '@threlte/studio';
import Tour from './Tour/Tour.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="svelte-zbgrhz"><!> <div id="tour-target" class="svelte-zbgrhz"></div></div>`);

export default function App($$anchor) {
	var div = root_1();
	var node = $.child(div);

	Canvas(node, {
		children: ($$anchor, $$slotProps) => {
			Studio($$anchor, {
				transient: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_1 = $.first_child(fragment_1);

					Scene(node_1, {});

					var node_2 = $.sibling(node_1, 2);

					Tour(node_2, {});
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.reset(div);
	$.append($$anchor, div);
}