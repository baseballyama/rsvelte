import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import { HTML } from '@threlte/extras';
import { World } from '@threlte/rapier';
import Scene from './Scene.svelte';
import { Pane, Button } from 'svelte-tweakpane-ui';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<p class="text-xs">It seems your browser doesn't support WASM.<br/> I'm sorry.</p>`);
var root_2 = $.from_html(`<!> <div class="svelte-1jc57aa"><!></div>`, 1);

export default function App($$anchor) {
	let testIndex = $.state(0);
	let version = $.state(0);
	var fragment = root_2();
	var node = $.first_child(fragment);

	Pane(node, {
		title: 'Colliders',
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Button(node_1, {
				label: 'type',
				title: 'Standalone',
				$$events: {
					click: () => {
						$.set(testIndex, 0);
						$.set(version, $.get(version) + 1);
					}
				}
			});

			var node_2 = $.sibling(node_1, 2);

			Button(node_2, {
				label: '',
				title: 'Attached',
				$$events: {
					click: () => {
						$.set(testIndex, 1);
						$.set(version, $.get(version) + 1);
					}
				}
			});

			var node_3 = $.sibling(node_2, 2);

			Button(node_3, {
				label: '',
				title: 'Sensor',
				$$events: {
					click: () => {
						$.set(testIndex, 2);
						$.set(version, $.get(version) + 1);
					}
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var node_4 = $.child(div);

	Canvas(node_4, {
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
						var fragment_4 = $.comment();
						var node_5 = $.first_child(fragment_4);

						$.key(node_5, () => $.get(version), ($$anchor) => {
							Scene($$anchor, {
								get testIndex() {
									return $.get(testIndex);
								}
							});
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