import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Scene from './Scene.svelte';
import { Canvas } from '@threlte/core';
import { Checkbox, Pane } from 'svelte-tweakpane-ui';

var root = $.from_html(`<!> <div class="svelte-hpv6gj"><!></div>`, 1);

export default function App($$anchor) {
	let showBounds = $.state(false);
	var fragment = root();
	var node = $.first_child(fragment);

	Pane(node, {
		title: 'meshBounds',
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			Checkbox($$anchor, {
				label: 'show bounds',
				get value() {
					return $.get(showBounds);
				},

				set value($$value) {
					$.set(showBounds, $$value, true);
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
				get showBounds() {
					return $.get(showBounds);
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
}