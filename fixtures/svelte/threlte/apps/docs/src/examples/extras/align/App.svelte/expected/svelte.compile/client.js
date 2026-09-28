import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';
import { Pane, Slider, Checkbox } from 'svelte-tweakpane-ui';

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <div class="svelte-1rt90eb"><!></div>`, 1);

export default function App($$anchor) {
	let x = $.state(0);
	let y = $.state(0);
	let z = $.state(0);
	let precise = $.state(false);
	let showSphere = $.state(true);
	let autoAlign = $.state(true);
	var fragment = root_1();
	var node = $.first_child(fragment);

	Pane(node, {
		title: 'Align',
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Slider(node_1, {
				label: 'X',
				min: -1,
				max: 1,
				get value() {
					return $.get(x);
				},

				set value($$value) {
					$.set(x, $$value, true);
				}
			});

			var node_2 = $.sibling(node_1, 2);

			Slider(node_2, {
				label: 'Y',
				min: -1,
				max: 1,
				get value() {
					return $.get(y);
				},

				set value($$value) {
					$.set(y, $$value, true);
				}
			});

			var node_3 = $.sibling(node_2, 2);

			Slider(node_3, {
				label: 'Z',
				min: -1,
				max: 1,
				get value() {
					return $.get(z);
				},

				set value($$value) {
					$.set(z, $$value, true);
				}
			});

			var node_4 = $.sibling(node_3, 2);

			Checkbox(node_4, {
				label: 'Precise',
				get value() {
					return $.get(precise);
				},

				set value($$value) {
					$.set(precise, $$value, true);
				}
			});

			var node_5 = $.sibling(node_4, 2);

			Checkbox(node_5, {
				label: 'Show Sphere',
				get value() {
					return $.get(showSphere);
				},

				set value($$value) {
					$.set(showSphere, $$value, true);
				}
			});

			var node_6 = $.sibling(node_5, 2);

			Checkbox(node_6, {
				label: 'Auto Align',
				get value() {
					return $.get(autoAlign);
				},

				set value($$value) {
					$.set(autoAlign, $$value, true);
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var node_7 = $.child(div);

	Canvas(node_7, {
		children: ($$anchor, $$slotProps) => {
			Scene($$anchor, {
				get x() {
					return $.get(x);
				},

				get y() {
					return $.get(y);
				},

				get z() {
					return $.get(z);
				},

				get precise() {
					return $.get(precise);
				},

				get showSphere() {
					return $.get(showSphere);
				},

				get autoAlign() {
					return $.get(autoAlign);
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
}