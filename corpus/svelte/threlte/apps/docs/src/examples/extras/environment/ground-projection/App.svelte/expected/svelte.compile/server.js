import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import { Checkbox, Pane } from 'svelte-tweakpane-ui';
import Scene from './Scene.svelte';

export default function App($$renderer) {
	let useGround = true;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Pane($$renderer, {
			title: 'ground projection',
			position: 'fixed',
			children: ($$renderer) => {
				Checkbox($$renderer, {
					label: 'use ground projection',
					get value() {
						return useGround;
					},

					set value($$value) {
						useGround = $$value;
						$$settled = false;
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="svelte-1b3xqfr">`);

		Canvas($$renderer, {
			children: ($$renderer) => {
				Scene($$renderer, { useGround });
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
}