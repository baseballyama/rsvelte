import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import { Pane, Slider, Checkbox } from 'svelte-tweakpane-ui';
import Scene from './Scene.svelte';

export default function App($$renderer) {
	let shadowOpacity = 0.5;
	let meshOpacity = 0.5;
	let overrideOpacity = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Pane($$renderer, {
			title: 'ShadowAlpha',
			position: 'fixed',
			children: ($$renderer) => {
				Slider($$renderer, {
					label: 'material opacity',
					min: 0,
					max: 1,
					step: 0.01,
					get value() {
						return meshOpacity;
					},

					set value($$value) {
						meshOpacity = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					label: 'override shadow opacity',
					get value() {
						return overrideOpacity;
					},

					set value($$value) {
						overrideOpacity = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Slider($$renderer, {
					label: 'shadow opacity',
					min: 0,
					max: 1,
					step: 0.01,
					disabled: !overrideOpacity,
					get value() {
						return shadowOpacity;
					},

					set value($$value) {
						shadowOpacity = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="svelte-1eanhih">`);

		Canvas($$renderer, {
			children: ($$renderer) => {
				Scene($$renderer, {
					meshOpacity,
					shadowOpacity: overrideOpacity ? shadowOpacity : undefined
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
}