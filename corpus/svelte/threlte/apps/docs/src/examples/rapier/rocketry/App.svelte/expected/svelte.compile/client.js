import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import { Debug, World } from '@threlte/rapier';
import Scene from './Scene.svelte';
import BatchedRenderer from './quarks/BatchedRenderer.svelte';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<main class="svelte-p6jdu7"><!></main>`);

export default function App($$anchor) {
	var main = root_1();
	var node = $.child(main);

	Canvas(node, {
		children: ($$anchor, $$slotProps) => {
			World($$anchor, {
				gravity: [0, -1, 0],
				framerate: 120,
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_1 = $.first_child(fragment_1);

					Debug(node_1, {});

					var node_2 = $.sibling(node_1, 2);

					BatchedRenderer(node_2, {});

					var node_3 = $.sibling(node_2, 2);

					Scene(node_3, {});
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(main);
	$.append($$anchor, main);
}