import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Scene from './Scene.svelte';
import { Canvas } from '@threlte/core';
import { Checkbox, Color, Folder, Pane, Wheel } from 'svelte-tweakpane-ui';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <div class="svelte-1qxlpye"><!></div>`, 1);

export default function App($$anchor) {
	let length = $.state(0.25);
	let segments = $.state(20);
	let materialColor = $.state('#ffffff');
	let materialWireframe = $.state(false);
	var fragment = root_2();
	var node = $.first_child(fragment);

	Pane(node, {
		position: 'fixed',
		title: '',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_1 = $.first_child(fragment_1);

			Wheel(node_1, {
				step: 0.1,
				label: 'length',
				get value() {
					return $.get(length);
				},

				set value($$value) {
					$.set(length, $$value, true);
				}
			});

			var node_2 = $.sibling(node_1, 2);

			Wheel(node_2, {
				step: 1,
				label: 'segments',
				get value() {
					return $.get(segments);
				},

				set value($$value) {
					$.set(segments, $$value, true);
				}
			});

			var node_3 = $.sibling(node_2, 2);

			Folder(node_3, {
				title: 'material props',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_4 = $.first_child(fragment_2);

					Color(node_4, {
						label: 'color',
						get value() {
							return $.get(materialColor);
						},

						set value($$value) {
							$.set(materialColor, $$value, true);
						}
					});

					var node_5 = $.sibling(node_4, 2);

					Checkbox(node_5, {
						label: 'wireframe',
						get value() {
							return $.get(materialWireframe);
						},

						set value($$value) {
							$.set(materialWireframe, $$value, true);
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
	var node_6 = $.child(div);

	Canvas(node_6, {
		children: ($$anchor, $$slotProps) => {
			Scene($$anchor, {
				get length() {
					return $.get(length);
				},

				get materialColor() {
					return $.get(materialColor);
				},

				get materialWireframe() {
					return $.get(materialWireframe);
				},

				get segments() {
					return $.get(segments);
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
}