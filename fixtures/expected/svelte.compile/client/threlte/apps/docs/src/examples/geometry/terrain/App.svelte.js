import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Scene from './Scene.svelte';
import { Canvas } from '@threlte/core';
import { Checkbox, Pane, Slider } from 'svelte-tweakpane-ui';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <div class="svelte-10p703q"><!></div>`, 1);

export default function App($$anchor) {
	let autoRotate = $.state(true);
	let flatness = $.state(4);
	var fragment = root_1();
	var node = $.first_child(fragment);

	Pane(node, {
		title: '3D noise terrain',
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Checkbox(node_1, {
				label: 'Auto-rotate Camera',
				get value() {
					return $.get(autoRotate);
				},

				set value($$value) {
					$.set(autoRotate, $$value, true);
				}
			});

			var node_2 = $.sibling(node_1, 2);

			Slider(node_2, {
				label: 'flatness',
				min: 1,
				max: 10,
				step: 1,
				get value() {
					return $.get(flatness);
				},

				set value($$value) {
					$.set(flatness, $$value, true);
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
				get autoRotate() {
					return $.get(autoRotate);
				},

				get flatness() {
					return $.get(flatness);
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
}