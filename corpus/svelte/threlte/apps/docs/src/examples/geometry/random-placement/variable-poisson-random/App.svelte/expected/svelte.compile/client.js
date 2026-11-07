import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';
import { Pane, Button } from 'svelte-tweakpane-ui';
import { radius } from './stores';

var root = $.from_html(`<!> <div class="svelte-1lqm4ql"><!></div>`, 1);

export default function App($$anchor) {
	let regen = $.state(false);
	var fragment = root();
	var node = $.first_child(fragment);

	Pane(node, {
		title: 'Adjusted Sampling',
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			Button($$anchor, {
				title: 'regenerate',
				$$events: {
					click: () => {
						$.set(regen, $.get(regen) + 1);
					}
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
				get regen() {
					return $.get(regen);
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
}