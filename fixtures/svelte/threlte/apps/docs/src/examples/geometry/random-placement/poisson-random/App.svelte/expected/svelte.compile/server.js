import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';
import { Pane, Button, Slider } from 'svelte-tweakpane-ui';
import { radius } from './stores';

export default function App($$renderer) {
	var $$store_subs;
	let regen = 0;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Pane($$renderer, {
			title: 'Poisson Disc Sampling',
			position: 'fixed',
			children: ($$renderer) => {
				Button($$renderer, { title: 'regenerate' });
				$$renderer.push(`<!----> `);

				Slider($$renderer, {
					label: 'Min Distance Between Objects',
					min: 1,
					max: 6,
					step: 0.5,
					get value() {
						return $.store_get($$store_subs ??= {}, '$radius', radius);
					},

					set value($$value) {
						$.store_set(radius, $$value);
						$$settled = false;
					}
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="svelte-a646g8">`);

		Canvas($$renderer, {
			children: ($$renderer) => {
				Scene($$renderer, { regen });
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

	if ($$store_subs) $.unsubscribe_stores($$store_subs);
}