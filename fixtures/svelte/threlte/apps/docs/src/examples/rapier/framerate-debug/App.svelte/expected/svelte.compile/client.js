import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import { Debug, World } from '@threlte/rapier';
import { Pane, Slider, Textarea } from 'svelte-tweakpane-ui';
import Scene from './Scene.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <main class="svelte-n3zcl5"><!></main>`, 1);

export default function App($$anchor, $$props) {
	$.push($$props, true);

	let minFramerate = 5;
	let framerate = $.state(minFramerate);
	var fragment = root_1();
	var node = $.first_child(fragment);

	Pane(node, {
		position: 'fixed',
		title: 'Framerate',
		width: 330,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Slider(node_1, {
				label: 'Framerate',
				min: minFramerate,
				max: 200,
				step: 1,
				get value() {
					return $.get(framerate);
				},

				set value($$value) {
					$.set(framerate, $$value, true);
				}
			});

			var node_2 = $.sibling(node_1, 2);

			{
				let $0 = $.derived(() => `Physics delta: ${(1 / $.get(framerate) * 1000).toFixed(2)}ms`);

				Textarea(node_2, {
					disabled: true,
					rows: 1,
					get value() {
						return $.get($0);
					}
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var main = $.sibling(node, 2);
	var node_3 = $.child(main);

	Canvas(node_3, {
		children: ($$anchor, $$slotProps) => {
			World($$anchor, {
				get framerate() {
					return $.get(framerate);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root();
					var node_4 = $.first_child(fragment_3);

					Debug(node_4, {});

					var node_5 = $.sibling(node_4, 2);

					Scene(node_5, {});
					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(main);
	$.append($$anchor, fragment);
	$.pop();
}