import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import { Debug, World } from '@threlte/rapier';
import { Pane, Slider, Textarea } from 'svelte-tweakpane-ui';
import Scene from './Scene.svelte';

export default function App($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let minFramerate = 5;
		let framerate = minFramerate;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Pane($$renderer, {
				position: 'fixed',
				title: 'Framerate',
				width: 330,
				children: ($$renderer) => {
					Slider($$renderer, {
						label: 'Framerate',
						min: minFramerate,
						max: 200,
						step: 1,
						get value() {
							return framerate;
						},

						set value($$value) {
							framerate = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Textarea($$renderer, {
						disabled: true,
						rows: 1,
						value: `Physics delta: ${(1 / framerate * 1000).toFixed(2)}ms`
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <main class="svelte-n3zcl5">`);

			Canvas($$renderer, {
				children: ($$renderer) => {
					World($$renderer, {
						framerate,
						children: ($$renderer) => {
							Debug($$renderer, {});
							$$renderer.push(`<!----> `);
							Scene($$renderer, {});
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></main>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}