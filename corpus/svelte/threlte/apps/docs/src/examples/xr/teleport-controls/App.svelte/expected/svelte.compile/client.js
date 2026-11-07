import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Scene from './Scene.svelte';
import { Canvas } from '@threlte/core';
import { Pane, Checkbox } from 'svelte-tweakpane-ui';
import { VRButton } from '@threlte/xr';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <div class="svelte-3iov37"><!> <!></div>`, 1);

export default function App($$anchor) {
	let showSurfaces = $.state(false);
	let showBlockers = $.state(false);
	var fragment = root_1();
	var node = $.first_child(fragment);

	Pane(node, {
		title: 'Teleport objects',
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Checkbox(node_1, {
				label: 'Show teleport surfaces',
				get value() {
					return $.get(showSurfaces);
				},

				set value($$value) {
					$.set(showSurfaces, $$value, true);
				}
			});

			var node_2 = $.sibling(node_1, 2);

			Checkbox(node_2, {
				label: 'Show teleport blockers',
				get value() {
					return $.get(showBlockers);
				},

				set value($$value) {
					$.set(showBlockers, $$value, true);
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var node_3 = $.child(div);

	Canvas(node_3, {
		children: ($$anchor, $$slotProps) => {
			Scene($$anchor, {
				get showSurfaces() {
					return $.get(showSurfaces);
				},

				get showBlockers() {
					return $.get(showBlockers);
				}
			});
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	VRButton(node_4, {});
	$.reset(div);
	$.append($$anchor, fragment);
}