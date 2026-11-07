import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox, Pane } from 'svelte-tweakpane-ui';
import Scene from './Scene.svelte';
import { Canvas } from '@threlte/core';
import { NoToneMapping } from 'three';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <div class="svelte-1cssqp6"><!></div>`, 1);

export default function App($$anchor) {
	let showCylinder = $.state(true);
	let auto = $.state(true);
	var fragment = root_1();
	var node = $.first_child(fragment);

	Pane(node, {
		title: 'Resize',
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Checkbox(node_1, {
				label: 'Show Cylinder',
				get value() {
					return $.get(showCylinder);
				},

				set value($$value) {
					$.set(showCylinder, $$value, true);
				}
			});

			var node_2 = $.sibling(node_1, 2);

			Checkbox(node_2, {
				label: 'Auto',
				get value() {
					return $.get(auto);
				},

				set value($$value) {
					$.set(auto, $$value, true);
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var node_3 = $.child(div);

	Canvas(node_3, {
		get toneMapping() {
			return NoToneMapping;
		},

		children: ($$anchor, $$slotProps) => {
			Scene($$anchor, {
				get showCylinder() {
					return $.get(showCylinder);
				},

				get auto() {
					return $.get(auto);
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
}