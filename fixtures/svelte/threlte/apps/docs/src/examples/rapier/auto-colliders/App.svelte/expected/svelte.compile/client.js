import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Pane, Checkbox, Button } from 'svelte-tweakpane-ui';
import { Canvas } from '@threlte/core';
import { HTML } from '@threlte/extras';
import { Debug, World } from '@threlte/rapier';
import Scene from './Scene.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<p class="text-xs">It seems your browser<br/> doesn't support WASM.<br/> I'm sorry.</p>`);
var root_2 = $.from_html(`<!> <div class="svelte-38302h"><!></div>`, 1);

export default function App($$anchor) {
	let version = $.state(0);
	let debug = $.state(true);
	var fragment = root_2();
	var node = $.first_child(fragment);

	Pane(node, {
		title: 'Auto Colliders',
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Checkbox(node_1, {
				label: 'Debug',
				get value() {
					return $.get(debug);
				},

				set value($$value) {
					$.set(debug, $$value, true);
				}
			});

			var node_2 = $.sibling(node_1, 2);

			Button(node_2, {
				title: 'reset',
				$$events: {
					click: () => {
						$.set(version, $.get(version) + 1);
					}
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
						var fragment_4 = root();
						var node_4 = $.first_child(fragment_4);

						{
							var consequent = ($$anchor) => {
								Debug($$anchor, {});
							};

							$.if(node_4, ($$render) => {
								if ($.get(debug)) $$render(consequent);
							});
						}

						var node_5 = $.sibling(node_4, 2);

						$.key(node_5, () => $.get(version), ($$anchor) => {
							Scene($$anchor, {});
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