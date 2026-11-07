import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Scene from './Scene.svelte';
import { Canvas } from '@threlte/core';
import { Pane, Slider } from 'svelte-tweakpane-ui';
import { WebGLRenderer } from 'three';

var root = $.from_html(`<!> <!>`, 1);

export default function App($$anchor, $$props) {
	$.push($$props, true);

	let w = $.state(0.01);
	var fragment = root();
	var node = $.first_child(fragment);

	Canvas(node, {
		createRenderer: (canvas) => {
			return new WebGLRenderer({ antialias: true, canvas, stencil: true });
		},

		children: ($$anchor, $$slotProps) => {
			Scene($$anchor, {
				get w() {
					return $.get(w);
				}
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Pane(node_1, {
		title: 'shadow mesh',
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			Slider($$anchor, {
				label: 'light position.w',
				min: 0.1,
				max: 0.9,
				get value() {
					return $.get(w);
				},

				set value($$value) {
					$.set(w, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}