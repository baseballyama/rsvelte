import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import { Checkbox, Pane, Slider } from 'svelte-tweakpane-ui';
import Scene from './Scene.svelte';

export default function App($$renderer) {
	let enabled = true;
	let size = 60;
	let focus = 0;
	let samples = 16;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Pane($$renderer, {
			title: 'SoftShadows',
			position: 'fixed',
			children: ($$renderer) => {
				Checkbox($$renderer, {
					label: 'enabled',
					get value() {
						return enabled;
					},

					set value($$value) {
						enabled = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Slider($$renderer, {
					label: 'size',
					min: 1,
					max: 100,
					step: 1,
					get value() {
						return size;
					},

					set value($$value) {
						size = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Slider($$renderer, {
					label: 'focus',
					min: 0,
					max: 2,
					step: 0.01,
					get value() {
						return focus;
					},

					set value($$value) {
						focus = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Slider($$renderer, {
					label: 'samples',
					min: 1,
					max: 32,
					step: 1,
					get value() {
						return samples;
					},

					set value($$value) {
						samples = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="svelte-zj73oo">`);

		Canvas($$renderer, {
			children: ($$renderer) => {
				Scene($$renderer, { enabled, size, focus, samples });
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