import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';
import { Pane, Button, Slider } from 'svelte-tweakpane-ui';

export default function App($$renderer) {
	let regen = 0;
	let numObjects = 50;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Pane($$renderer, {
			title: 'Completely Random',
			position: 'fixed',
			children: ($$renderer) => {
				Button($$renderer, { title: 'regenerate' });
				$$renderer.push(`<!----> `);

				Slider($$renderer, {
					label: 'Number of Objects',
					min: 20,
					max: 100,
					step: 10,
					get value() {
						return numObjects;
					},

					set value($$value) {
						numObjects = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="svelte-y0zct5">`);

		Canvas($$renderer, {
			children: ($$renderer) => {
				Scene($$renderer, { regen, numObjects });
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