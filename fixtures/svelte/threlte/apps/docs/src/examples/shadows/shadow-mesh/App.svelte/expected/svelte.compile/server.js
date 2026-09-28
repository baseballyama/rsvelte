import * as $ from 'svelte/internal/server';
import Scene from './Scene.svelte';
import { Canvas } from '@threlte/core';
import { Pane, Slider } from 'svelte-tweakpane-ui';
import { WebGLRenderer } from 'three';

export default function App($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let w = 0.01;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Canvas($$renderer, {
				createRenderer: (canvas) => {
					return new WebGLRenderer({ antialias: true, canvas, stencil: true });
				},

				children: ($$renderer) => {
					Scene($$renderer, { w });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Pane($$renderer, {
				title: 'shadow mesh',
				position: 'fixed',
				children: ($$renderer) => {
					Slider($$renderer, {
						label: 'light position.w',
						min: 0.1,
						max: 0.9,
						get value() {
							return w;
						},

						set value($$value) {
							w = $$value;
							$$settled = false;
						}
					});
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
	});
}