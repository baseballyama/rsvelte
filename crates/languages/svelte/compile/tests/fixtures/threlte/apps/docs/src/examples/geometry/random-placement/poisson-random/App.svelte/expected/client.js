import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';
import { Pane, Button, Slider } from 'svelte-tweakpane-ui';
import { radius } from './stores';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <div class="svelte-a646g8"><!></div>`, 1);

export default function App($$anchor) {
	const $radius = () => $.store_get(radius, '$radius', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let regen = $.state(0);
	var fragment = root_1();
	var node = $.first_child(fragment);

	Pane(node, {
		title: 'Poisson Disc Sampling',
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Button(node_1, {
				title: 'regenerate',
				$$events: {
					click: () => {
						$.set(regen, $.get(regen) + 1);
					}
				}
			});

			var node_2 = $.sibling(node_1, 2);

			Slider(node_2, {
				label: 'Min Distance Between Objects',
				min: 1,
				max: 6,
				step: 0.5,
				get value() {
					$.mark_store_binding();

					return $radius();
				},

				set value($$value) {
					$.store_set(radius, $$value);
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
				get regen() {
					return $.get(regen);
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
	$$cleanup();
}