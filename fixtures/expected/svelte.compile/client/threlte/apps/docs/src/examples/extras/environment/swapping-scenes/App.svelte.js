import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Scene from './Scene.svelte';
import { Button, Checkbox, Pane } from 'svelte-tweakpane-ui';
import { Canvas } from '@threlte/core';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <div class="svelte-hyg9v3"><!></div>`, 1);

export default function App($$anchor) {
	const sides = ['left', 'right'];
	let i = $.state(0);
	let side = $.derived(() => sides[$.get(i)]);
	let useEnvironment = $.state(true);
	let isBackground = $.state(false);
	let disabled = $.derived(() => !$.get(useEnvironment));
	var fragment = root_1();
	var node = $.first_child(fragment);

	Pane(node, {
		title: 'Environment - Swapping Scenes',
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Checkbox(node_1, {
				label: 'use <Environment>',
				get value() {
					return $.get(useEnvironment);
				},

				set value($$value) {
					$.set(useEnvironment, $$value, true);
				}
			});

			var node_2 = $.sibling(node_1, 2);

			Checkbox(node_2, {
				get disabled() {
					return $.get(disabled);
				},
				label: 'is background',
				get value() {
					return $.get(isBackground);
				},

				set value($$value) {
					$.set(isBackground, $$value, true);
				}
			});

			var node_3 = $.sibling(node_2, 2);

			Button(node_3, {
				get disabled() {
					return $.get(disabled);
				},
				title: 'swap scene',
				$$events: {
					click: () => {
						$.set(i, ($.get(i) + 1) % sides.length);
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
				get isBackground() {
					return $.get(isBackground);
				},

				get side() {
					return $.get(side);
				},

				get useEnvironment() {
					return $.get(useEnvironment);
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
}