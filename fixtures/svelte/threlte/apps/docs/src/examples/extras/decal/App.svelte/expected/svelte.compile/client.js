import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import { Suspense } from '@threlte/extras';
import { World } from '@threlte/rapier';
import Scene from './Scene.svelte';
import { Pane, Checkbox } from 'svelte-tweakpane-ui';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <div class="svelte-i7hpsr"><!></div>`, 1);

export default function App($$anchor) {
	let controls = $.state(false);
	let debug = $.state(false);
	var fragment = root_1();
	var node = $.first_child(fragment);

	Pane(node, {
		title: 'Decal',
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Checkbox(node_1, {
				label: 'Controls',
				get value() {
					return $.get(controls);
				},

				set value($$value) {
					$.set(controls, $$value, true);
				}
			});

			var node_2 = $.sibling(node_1, 2);

			Checkbox(node_2, {
				label: 'Debug',
				get value() {
					return $.get(debug);
				},

				set value($$value) {
					$.set(debug, $$value, true);
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
				gravity: [0, 0, 0],
				children: ($$anchor, $$slotProps) => {
					Suspense($$anchor, {
						children: ($$anchor, $$slotProps) => {
							Scene($$anchor, {
								get controls() {
									return $.get(controls);
								},

								get debug() {
									return $.get(debug);
								}
							});
						},
						$$slots: { default: true }
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