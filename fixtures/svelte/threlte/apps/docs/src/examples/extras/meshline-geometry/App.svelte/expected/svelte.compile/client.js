import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';
import { List, Pane, Slider, Color } from 'svelte-tweakpane-ui';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <div class="svelte-q6oaii"><!></div>`, 1);

export default function App($$anchor) {
	const shapeOptions = { none: 'none', taper: 'taper' };
	let shape = $.state('taper');
	let color = $.state('#fe3d00');
	let width = $.state(1);
	var fragment = root_1();
	var node = $.first_child(fragment);

	Pane(node, {
		title: '',
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			List(node_1, {
				get options() {
					return shapeOptions;
				},
				label: 'shape',
				get value() {
					return $.get(shape);
				},

				set value($$value) {
					$.set(shape, $$value, true);
				}
			});

			var node_2 = $.sibling(node_1, 2);

			Color(node_2, {
				label: 'color',
				get value() {
					return $.get(color);
				},

				set value($$value) {
					$.set(color, $$value, true);
				}
			});

			var node_3 = $.sibling(node_2, 2);

			Slider(node_3, {
				label: 'width',
				min: 0.1,
				max: 5,
				step: 0.1,
				get value() {
					return $.get(width);
				},

				set value($$value) {
					$.set(width, $$value, true);
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
				get shape() {
					return $.get(shape);
				},

				get color() {
					return $.get(color);
				},

				get width() {
					return $.get(width);
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
}