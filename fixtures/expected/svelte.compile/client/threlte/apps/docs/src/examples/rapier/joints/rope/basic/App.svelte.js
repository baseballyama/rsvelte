import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';
import { World } from '@threlte/rapier';
import { Checkbox, Pane, Slider } from 'svelte-tweakpane-ui';
import { NoToneMapping } from 'three';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <div class="svelte-zcw1rf"><!></div>`, 1);

export default function App($$anchor) {
	let debug = $.state(false);
	let damping = $.state(0.8);
	let segments = $.state(20);
	var fragment = root_1();
	var node = $.first_child(fragment);

	Pane(node, {
		position: 'fixed',
		title: 'Rope',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Checkbox(node_1, {
				label: 'Debug',
				get value() {
					return $.get(debug);
				},

				set value($$value) {
					$.set(debug, $$value, true);
				}
			});

			var node_2 = $.sibling(node_1, 2);

			Slider(node_2, {
				label: 'Damping',
				min: 0,
				max: 1,
				step: 0.01,
				get value() {
					return $.get(damping);
				},

				set value($$value) {
					$.set(damping, $$value, true);
				}
			});

			var node_3 = $.sibling(node_2, 2);

			Slider(node_3, {
				label: 'Segments',
				min: 2,
				max: 20,
				step: 1,
				get value() {
					return $.get(segments);
				},

				set value($$value) {
					$.set(segments, $$value, true);
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var node_4 = $.child(div);

	Canvas(node_4, {
		get toneMapping() {
			return NoToneMapping;
		},

		children: ($$anchor, $$slotProps) => {
			World($$anchor, {
				children: ($$anchor, $$slotProps) => {
					Scene($$anchor, {
						get debug() {
							return $.get(debug);
						},

						get damping() {
							return $.get(damping);
						},

						get segments() {
							return $.get(segments);
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