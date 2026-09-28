import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import { HTML } from '@threlte/extras';
import { World } from '@threlte/rapier';
import { Button, Checkbox, Pane } from 'svelte-tweakpane-ui';
import Scene from './Scene.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<p class="text-xs">It seems your browser<br/> doesn't support WASM.<br/> I'm sorry.</p>`);
var root_2 = $.from_html(`<!> <div class="svelte-g4xu35"><!></div>`, 1);

export default function App($$anchor) {
	let debug = $.state(false);
	let resetKey = $.state(0);
	var fragment = root_2();
	var node = $.first_child(fragment);

	Pane(node, {
		position: 'fixed',
		title: 'Prismatic Joint',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Button(node_1, {
				title: 'Reset',
				$$events: { click: () => $.update(resetKey) }
			});

			var node_2 = $.sibling(node_1, 2);

			Checkbox(node_2, {
				label: 'Debug',
				get value() {
					return $.get(debug);
				},

				set value($$value) {
					$.set(debug, $$value, true);
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
			{
				const fallback = ($$anchor) => {
					HTML($$anchor, {
						transform: true,
						children: ($$anchor, $$slotProps) => {
							var p = root_1();

							$.append($$anchor, p);
						},
						$$slots: { default: true }
					});
				};

				World($$anchor, {
					fallback,
					children: ($$anchor, $$slotProps) => {
						Scene($$anchor, {
							get debug() {
								return $.get(debug);
							},

							get resetKey() {
								return $.get(resetKey);
							}
						});
					},
					$$slots: { fallback: true, default: true }
				});
			}
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
}