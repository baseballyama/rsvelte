import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Scene from './Scene.svelte';
import { Canvas } from '@threlte/core';
import { Slider, Pane } from 'svelte-tweakpane-ui';

var root = $.from_html(`<!> <!>`, 1);

export default function App($$anchor) {
	let size = $.state(10);
	var fragment = root();
	var node = $.first_child(fragment);

	Pane(node, {
		position: 'fixed',
		title: 'Instanced Colors',
		children: ($$anchor, $$slotProps) => {
			Slider($$anchor, {
				min: 10,
				max: 50,
				step: 10,
				get value() {
					return $.get(size);
				},

				set value($$value) {
					$.set(size, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Canvas(node_1, {
		children: ($$anchor, $$slotProps) => {
			Scene($$anchor, {
				get size() {
					return $.get(size);
				}
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}