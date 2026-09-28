import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';
import { Color, Pane } from 'svelte-tweakpane-ui';

var root = $.from_html(`<!> <!>`, 1);

export default function App($$anchor) {
	let color = $.state('#000000');
	var fragment = root();
	var node = $.first_child(fragment);

	Canvas(node, {
		children: ($$anchor, $$slotProps) => {
			Scene($$anchor, {
				get color() {
					return $.get(color);
				}
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Pane(node_1, {
		title: 'shadow material',
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			Color($$anchor, {
				label: 'shadow color',
				get value() {
					return $.get(color);
				},

				set value($$value) {
					$.set(color, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}