import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';
import { Checkbox, Pane } from 'svelte-tweakpane-ui';
import { Suspense } from '@threlte/extras';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <div class="svelte-14owz5s"><!></div>`, 1);

export default function App($$anchor) {
	let red = $.state(true);
	let blue = $.state(true);
	var fragment = root_1();
	var node = $.first_child(fragment);

	Pane(node, {
		title: 'Transitions',
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Checkbox(node_1, {
				label: 'Toggle Red',
				get value() {
					return $.get(red);
				},

				set value($$value) {
					$.set(red, $$value, true);
				}
			});

			var node_2 = $.sibling(node_1, 2);

			Checkbox(node_2, {
				label: 'Toggle Blue',
				get value() {
					return $.get(blue);
				},

				set value($$value) {
					$.set(blue, $$value, true);
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
			Suspense($$anchor, {
				children: ($$anchor, $$slotProps) => {
					Scene($$anchor, {
						get red() {
							return $.get(red);
						},

						get blue() {
							return $.get(blue);
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