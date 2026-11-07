import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import { Pane, List, Text } from 'svelte-tweakpane-ui';
import Scene from './Scene.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <div class="svelte-1x9gam7"><!></div>`, 1);

export default function App($$anchor) {
	const sprintKeyOptions = { Shift: 'Shift', Space: 'Space', e: 'e' };
	let sprintKey = $.state('Shift');
	let activeDevice = $.state('keyboard');
	var fragment = root_1();
	var node = $.first_child(fragment);

	Pane(node, {
		title: 'Input',
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			List(node_1, {
				get options() {
					return sprintKeyOptions;
				},
				label: 'sprint key',
				get value() {
					return $.get(sprintKey);
				},

				set value($$value) {
					$.set(sprintKey, $$value, true);
				}
			});

			var node_2 = $.sibling(node_1, 2);

			Text(node_2, {
				get value() {
					return $.get(activeDevice);
				},
				label: 'device',
				disabled: true
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
				get sprintKey() {
					return $.get(sprintKey);
				},

				get activeDevice() {
					return $.get(activeDevice);
				},

				set activeDevice($$value) {
					$.set(activeDevice, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
}