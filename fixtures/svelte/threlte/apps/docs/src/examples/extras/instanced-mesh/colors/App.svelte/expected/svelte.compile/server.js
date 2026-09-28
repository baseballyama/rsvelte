import * as $ from 'svelte/internal/server';
import Scene from './Scene.svelte';
import { Canvas } from '@threlte/core';
import { Slider, Pane } from 'svelte-tweakpane-ui';

export default function App($$renderer) {
	let size = 10;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Pane($$renderer, {
			position: 'fixed',
			title: 'Instanced Colors',
			children: ($$renderer) => {
				Slider($$renderer, {
					min: 10,
					max: 50,
					step: 10,
					get value() {
						return size;
					},

					set value($$value) {
						size = $$value;
						$$settled = false;
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Canvas($$renderer, {
			children: ($$renderer) => {
				Scene($$renderer, { size });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}