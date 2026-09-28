import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import { HTML } from '@threlte/extras';
import { Debug, World } from '@threlte/rapier';
import Scene from './Scene.svelte';
import { Pane, Button } from 'svelte-tweakpane-ui';

var root = $.from_html(`<p class="svelte-a07qv5">It seems your browser<br/> doesn't support WASM.<br/> I'm sorry.</p>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <div class="svelte-a07qv5"><!></div>`, 1);

export default function App($$anchor) {
	let reset;
	var fragment = root_2();
	var node = $.first_child(fragment);

	Pane(node, {
		title: 'Collision Groups',
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			Button($$anchor, { title: 'Reset', $$events: { click: reset } });
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var node_1 = $.child(div);

	Canvas(node_1, {
		children: ($$anchor, $$slotProps) => {
			{
				const fallback = ($$anchor) => {
					HTML($$anchor, {
						transform: true,
						children: ($$anchor, $$slotProps) => {
							var p = root();

							$.append($$anchor, p);
						},
						$$slots: { default: true }
					});
				};

				World($$anchor, {
					fallback,
					children: ($$anchor, $$slotProps) => {
						var fragment_4 = root_1();
						var node_2 = $.first_child(fragment_4);

						Debug(node_2, {});

						var node_3 = $.sibling(node_2, 2);

						Scene(node_3, {
							get reset() {
								return reset;
							},

							set reset($$value) {
								reset = $$value;
							}
						});

						$.append($$anchor, fragment_4);
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