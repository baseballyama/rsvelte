import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import { World } from '@threlte/rapier';
import { Checkbox, Pane } from 'svelte-tweakpane-ui';
import Scene from './Scene.svelte';
import { gameState } from './gameState.svelte';

var root = $.from_html(`<!> <div aria-hidden="true" class="svelte-1eoul5f"><!></div>`, 1);

export default function App($$anchor, $$props) {
	$.push($$props, true);

	let debug = $.state(false);
	var fragment = root();

	$.event('keydown', $.window, (event) => {
		if (event.code !== 'Space' || event.repeat) return;

		event.preventDefault();
		gameState.holding = true;
	});

	$.event('keyup', $.window, (event) => {
		if (event.code !== 'Space') return;

		event.preventDefault();
		gameState.holding = false;
	});

	var node = $.first_child(fragment);

	Pane(node, {
		position: 'fixed',
		title: '',
		children: ($$anchor, $$slotProps) => {
			Checkbox($$anchor, {
				label: 'Debug',
				get value() {
					return $.get(debug);
				},

				set value($$value) {
					$.set(debug, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var node_1 = $.child(div);

	Canvas(node_1, {
		children: ($$anchor, $$slotProps) => {
			World($$anchor, {
				gravity: [0, -18, 0],
				children: ($$anchor, $$slotProps) => {
					Scene($$anchor, {
						get debug() {
							return $.get(debug);
						}
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);

	$.delegated('pointerdown', div, (event) => {
		if (event.button !== 0 || !event.isPrimary) return;

		event.currentTarget.setPointerCapture(event.pointerId);
		gameState.holding = true;
	});

	$.delegated('pointerup', div, (event) => {
		if (!event.isPrimary) return;

		gameState.holding = false;
	});

	$.event('pointercancel', div, (event) => {
		if (!event.isPrimary) return;

		gameState.holding = false;
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['pointerdown', 'pointerup']);