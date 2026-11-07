import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Scene from './Scene.svelte';
import { Button, Pane } from 'svelte-tweakpane-ui';
import { Canvas } from '@threlte/core';
import { World } from '@threlte/rapier';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <div class="svelte-1izvkyu"><!></div>`, 1);

export default function App($$anchor) {
	let resetCounter = $.state(0);
	let showDebug = $.state(false);
	var fragment = root_1();
	var node = $.first_child(fragment);

	Pane(node, {
		title: '',
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Button(node_1, {
				title: 'Reset',
				$$events: {
					click: () => {
						$.set(resetCounter, $.get(resetCounter) + 1);
					}
				}
			});

			var node_2 = $.sibling(node_1, 2);

			Button(node_2, {
				title: 'Toggle Debug',
				$$events: {
					click: () => {
						$.set(showDebug, !$.get(showDebug));
					}
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var node_3 = $.child(div);

	Canvas(node_3, {
		children: ($$anchor, $$slotProps) => {
			World($$anchor, {
				children: ($$anchor, $$slotProps) => {
					Scene($$anchor, {
						get resetCounter() {
							return $.get(resetCounter);
						},

						get showDebug() {
							return $.get(showDebug);
						}
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
}