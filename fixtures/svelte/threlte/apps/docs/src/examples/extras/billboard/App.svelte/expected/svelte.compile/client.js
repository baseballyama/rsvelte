import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Scene from './Scene.svelte';
import { Canvas } from '@threlte/core';
import { Pane, Checkbox } from 'svelte-tweakpane-ui';

var root = $.from_html(`<!> <!>`, 1);

export default function App($$anchor) {
	let follow = $.state(true);
	var fragment = root();
	var node = $.first_child(fragment);

	Pane(node, {
		title: 'Billboard',
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			Checkbox($$anchor, {
				label: 'follow',
				get value() {
					return $.get(follow);
				},

				set value($$value) {
					$.set(follow, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Canvas(node_1, {
		children: ($$anchor, $$slotProps) => {
			Scene($$anchor, {
				get follow() {
					return $.get(follow);
				}
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}