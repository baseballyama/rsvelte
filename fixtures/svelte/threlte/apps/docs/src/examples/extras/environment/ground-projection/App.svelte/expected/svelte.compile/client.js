import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import { Checkbox, Pane } from 'svelte-tweakpane-ui';
import Scene from './Scene.svelte';

var root = $.from_html(`<!> <div class="svelte-1b3xqfr"><!></div>`, 1);

export default function App($$anchor) {
	let useGround = $.state(true);
	var fragment = root();
	var node = $.first_child(fragment);

	Pane(node, {
		title: 'ground projection',
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			Checkbox($$anchor, {
				label: 'use ground projection',
				get value() {
					return $.get(useGround);
				},

				set value($$value) {
					$.set(useGround, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var node_1 = $.child(div);

	Canvas(node_1, {
		children: ($$anchor, $$slotProps) => {
			Scene($$anchor, {
				get useGround() {
					return $.get(useGround);
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
}