import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import { HTML } from '@threlte/extras';
import { World } from '@threlte/rapier';
import { muted } from './Particle.svelte';
import Scene from './Scene.svelte';
import { Pane, Button } from 'svelte-tweakpane-ui';

var root = $.from_html(`<p class="svelte-1bcopus">It seems your browser doesn't support WASM.<br/> I'm sorry.</p>`);
var root_1 = $.from_html(`<!> <div class="svelte-1bcopus"><!></div>`, 1);

export default function App($$anchor) {
	const $muted = () => $.store_get(muted, '$muted', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	var fragment = root_1();
	var node = $.first_child(fragment);

	Pane(node, {
		title: 'Rigid Body',
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			Button($$anchor, {
				title: 'toggle sound',
				$$events: {
					click: () => {
						$.store_set(muted, !$muted());
					}
				}
			});
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
						Scene($$anchor, {});
					},
					$$slots: { fallback: true, default: true }
				});
			}
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
	$$cleanup();
}