import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';
import { Checkbox, Pane } from 'svelte-tweakpane-ui';

var root = $.from_html(`<!> <div class="svelte-qkr43q"><!></div>`, 1);

export default function App($$anchor) {
	let debug = $.state(true);
	var fragment = root();
	var node = $.first_child(fragment);

	Pane(node, {
		title: 'Virtual Environment',
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			Checkbox($$anchor, {
				label: 'debug',
				get value() {
					return $.get(debug);
				},

				set value($$value) {
					$.set(debug, $$value, true);
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
				get debug() {
					return $.get(debug);
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
}