import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Pane, Button } from 'svelte-tweakpane-ui';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <div class="svelte-vn43nl"><!></div>`, 1);

export default function App($$anchor) {
	let action = $.state('idle');
	var fragment = root_1();
	var node = $.first_child(fragment);

	Pane(node, {
		title: 'Transitions',
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Button(node_1, {
				title: 'Idle',
				$$events: {
					click: () => {
						$.set(action, 'idle');
					}
				}
			});

			var node_2 = $.sibling(node_1, 2);

			Button(node_2, {
				title: 'Walk',
				$$events: {
					click: () => {
						$.set(action, 'walk');
					}
				}
			});

			var node_3 = $.sibling(node_2, 2);

			Button(node_3, {
				title: 'Run',
				$$events: {
					click: () => {
						$.set(action, 'run');
					}
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var node_4 = $.child(div);

	Canvas(node_4, {
		children: ($$anchor, $$slotProps) => {
			Scene($$anchor, {
				get action() {
					return $.get(action);
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
}