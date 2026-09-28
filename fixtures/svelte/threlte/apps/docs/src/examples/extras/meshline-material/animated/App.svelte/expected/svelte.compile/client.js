import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';
import { Checkbox, Folder, Pane, Slider } from 'svelte-tweakpane-ui';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <div class="svelte-13cqxt"><!></div>`, 1);

export default function App($$anchor) {
	let opacity = $.state(1);
	let dashArray = $.state(0.5);
	let dashRatio = $.state(0.5);
	let attenuate = $.state(true);
	let scaleDown = $.state(0);
	var fragment = root_2();
	var node = $.first_child(fragment);

	Pane(node, {
		title: '',
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_1 = $.first_child(fragment_1);

			Slider(node_1, {
				label: 'opacity',
				min: 0,
				max: 1,
				step: 0.01,
				get value() {
					return $.get(opacity);
				},

				set value($$value) {
					$.set(opacity, $$value, true);
				}
			});

			var node_2 = $.sibling(node_1, 2);

			Checkbox(node_2, {
				label: 'attenuate',
				get value() {
					return $.get(attenuate);
				},

				set value($$value) {
					$.set(attenuate, $$value, true);
				}
			});

			var node_3 = $.sibling(node_2, 2);

			Slider(node_3, {
				label: 'scaleDown',
				min: 0,
				max: 10,
				step: 0.1,
				get value() {
					return $.get(scaleDown);
				},

				set value($$value) {
					$.set(scaleDown, $$value, true);
				}
			});

			var node_4 = $.sibling(node_3, 2);

			Folder(node_4, {
				title: 'Dash',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_5 = $.first_child(fragment_2);

					Slider(node_5, {
						label: 'dashArray',
						min: 0,
						max: 1,
						step: 0.01,
						get value() {
							return $.get(dashArray);
						},

						set value($$value) {
							$.set(dashArray, $$value, true);
						}
					});

					var node_6 = $.sibling(node_5, 2);

					Slider(node_6, {
						label: 'dashRatio',
						min: 0,
						max: 1,
						step: 0.01,
						get value() {
							return $.get(dashRatio);
						},

						set value($$value) {
							$.set(dashRatio, $$value, true);
						}
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
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
				get opacity() {
					return $.get(opacity);
				},

				get dashArray() {
					return $.get(dashArray);
				},

				get dashRatio() {
					return $.get(dashRatio);
				},

				get attenuate() {
					return $.get(attenuate);
				},

				get scaleDown() {
					return $.get(scaleDown);
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
}