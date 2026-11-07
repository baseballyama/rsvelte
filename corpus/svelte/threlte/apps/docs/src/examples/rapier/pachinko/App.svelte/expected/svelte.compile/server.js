import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import { World } from '@threlte/rapier';
import { Checkbox, Pane } from 'svelte-tweakpane-ui';
import Scene from './Scene.svelte';
import { gameState } from './gameState.svelte';

export default function App($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let debug = false;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Pane($$renderer, {
				position: 'fixed',
				title: '',
				children: ($$renderer) => {
					Checkbox($$renderer, {
						label: 'Debug',
						get value() {
							return debug;
						},

						set value($$value) {
							debug = $$value;
							$$settled = false;
						}
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div aria-hidden="true" class="svelte-1eoul5f">`);

			Canvas($$renderer, {
				children: ($$renderer) => {
					World($$renderer, {
						gravity: [0, -18, 0],
						children: ($$renderer) => {
							Scene($$renderer, { debug });
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}