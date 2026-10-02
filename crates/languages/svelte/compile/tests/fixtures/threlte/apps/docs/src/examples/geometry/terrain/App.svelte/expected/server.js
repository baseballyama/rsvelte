import * as $ from 'svelte/internal/server';
import Scene from './Scene.svelte';
import { Canvas } from '@threlte/core';
import { Checkbox, Pane, Slider } from 'svelte-tweakpane-ui';

export default function App($$renderer) {
	let autoRotate = true;
	let flatness = 4;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Pane($$renderer, {
			title: '3D noise terrain',
			position: 'fixed',
			children: ($$renderer) => {
				Checkbox($$renderer, {
					label: 'Auto-rotate Camera',
					get value() {
						return autoRotate;
					},

					set value($$value) {
						autoRotate = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Slider($$renderer, {
					label: 'flatness',
					min: 1,
					max: 10,
					step: 1,
					get value() {
						return flatness;
					},

					set value($$value) {
						flatness = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="svelte-10p703q">`);

		Canvas($$renderer, {
			children: ($$renderer) => {
				Scene($$renderer, { autoRotate, flatness });
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