import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import { Checkbox, Pane, Slider } from 'svelte-tweakpane-ui';
import Scene from './Scene.svelte';

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <div class="svelte-zj73oo"><!></div>`, 1);

export default function App($$anchor) {
	let enabled = $.state(true);
	let size = $.state(60);
	let focus = $.state(0);
	let samples = $.state(16);
	var fragment = root_1();
	var node = $.first_child(fragment);

	Pane(node, {
		title: 'SoftShadows',
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Checkbox(node_1, {
				label: 'enabled',
				get value() {
					return $.get(enabled);
				},

				set value($$value) {
					$.set(enabled, $$value, true);
				}
			});

			var node_2 = $.sibling(node_1, 2);

			Slider(node_2, {
				label: 'size',
				min: 1,
				max: 100,
				step: 1,
				get value() {
					return $.get(size);
				},

				set value($$value) {
					$.set(size, $$value, true);
				}
			});

			var node_3 = $.sibling(node_2, 2);

			Slider(node_3, {
				label: 'focus',
				min: 0,
				max: 2,
				step: 0.01,
				get value() {
					return $.get(focus);
				},

				set value($$value) {
					$.set(focus, $$value, true);
				}
			});

			var node_4 = $.sibling(node_3, 2);

			Slider(node_4, {
				label: 'samples',
				min: 1,
				max: 32,
				step: 1,
				get value() {
					return $.get(samples);
				},

				set value($$value) {
					$.set(samples, $$value, true);
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var node_5 = $.child(div);

	Canvas(node_5, {
		children: ($$anchor, $$slotProps) => {
			Scene($$anchor, {
				get enabled() {
					return $.get(enabled);
				},

				get size() {
					return $.get(size);
				},

				get focus() {
					return $.get(focus);
				},

				get samples() {
					return $.get(samples);
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
}