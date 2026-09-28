import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Scene from './Scene.svelte';
import { Canvas } from '@threlte/core';
import { Checkbox, Pane } from 'svelte-tweakpane-ui';

var root = $.from_html(`<!> <div class="svelte-15uvn8"><!></div>`, 1);

export default function App($$anchor) {
	let resize = $.state(true);
	var fragment = root();
	var node = $.first_child(fragment);

	Pane(node, {
		position: 'fixed',
		title: 'objects',
		children: ($$anchor, $$slotProps) => {
			Checkbox($$anchor, {
				label: 'resize',
				get value() {
					return $.get(resize);
				},

				set value($$value) {
					$.set(resize, $$value, true);
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
				get resize() {
					return $.get(resize);
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
}