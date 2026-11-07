import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Scene from './Scene.svelte';
import { Canvas } from '@threlte/core';
import { Checkbox, Pane } from 'svelte-tweakpane-ui';

var root = $.from_html(`<!> <div class="svelte-eg0rw4"><!></div>`, 1);

export default function App($$anchor) {
	let autoRender = $.state(true);
	var fragment = root();
	var node = $.first_child(fragment);

	Pane(node, {
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			Checkbox($$anchor, {
				label: 'auto render',
				get value() {
					return $.get(autoRender);
				},

				set value($$value) {
					$.set(autoRender, $$value, true);
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
				get autoRender() {
					return $.get(autoRender);
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
}