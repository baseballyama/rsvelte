import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';
import { Pane, Button, Slider } from 'svelte-tweakpane-ui';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <div class="svelte-y0zct5"><!></div>`, 1);

export default function App($$anchor) {
	let regen = $.state(0);
	let numObjects = $.state(50);
	var fragment = root_1();
	var node = $.first_child(fragment);

	Pane(node, {
		title: 'Completely Random',
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Button(node_1, {
				title: 'regenerate',
				$$events: {
					click: () => {
						$.set(regen, $.get(regen) + 1);
					}
				}
			});

			var node_2 = $.sibling(node_1, 2);

			Slider(node_2, {
				label: 'Number of Objects',
				min: 20,
				max: 100,
				step: 10,
				get value() {
					return $.get(numObjects);
				},

				set value($$value) {
					$.set(numObjects, $$value, true);
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
			Scene($$anchor, {
				get regen() {
					return $.get(regen);
				},

				get numObjects() {
					return $.get(numObjects);
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
}