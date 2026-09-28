import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';
import { Checkbox, Pane } from 'svelte-tweakpane-ui';
import { Suspense } from '@threlte/extras';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <div class="svelte-mnc17a"><!></div>`, 1);

export default function App($$anchor) {
	let debug = $.state(true);
	let mixEnvironment = $.state(true);
	var fragment = root_1();
	var node = $.first_child(fragment);

	Pane(node, {
		title: 'Virtual Environment',
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Checkbox(node_1, {
				label: 'debug',
				get value() {
					return $.get(debug);
				},

				set value($$value) {
					$.set(debug, $$value, true);
				}
			});

			var node_2 = $.sibling(node_1, 2);

			Checkbox(node_2, {
				label: 'Mix Environment Map',
				get value() {
					return $.get(mixEnvironment);
				},

				set value($$value) {
					$.set(mixEnvironment, $$value, true);
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
				get debug() {
					return $.get(debug);
				},

				get mixEnvironment() {
					return $.get(mixEnvironment);
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
}