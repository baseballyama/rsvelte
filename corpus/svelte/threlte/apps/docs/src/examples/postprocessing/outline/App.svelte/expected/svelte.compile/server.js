import * as $ from 'svelte/internal/server';
import CustomRenderer from './CustomRenderer.svelte';
import Scene from './Scene.svelte';
import { Canvas } from '@threlte/core';
import { Checkbox, Pane } from 'svelte-tweakpane-ui';
import { Mesh, Shape } from 'three';

export default function App($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const mesh = new Mesh();
		let paused = false;

		const walls = [
			{
				height: 3,
				shape: new Shape().moveTo(3.5, -4.5).lineTo(3.5, -3.5).lineTo(5.5, -3.5).lineTo(5.5, -0.5).lineTo(-2.5, -0.5).lineTo(-2.5, 0.5).lineTo(5.5, 0.5).lineTo(5.5, 3.5).lineTo(-0.5, 3.5).lineTo(-0.5, 4.5).lineTo(6.5, 4.5).lineTo(6.5, -4.5)
			},

			{
				height: 3,
				shape: new Shape().moveTo(-6.5, -4.5).lineTo(-6.5, 4.5).lineTo(-3.5, 4.5).lineTo(-3.5, 3.5).lineTo(-5.5, 3.5).lineTo(-5.5, -3.5).lineTo(0.5, -3.5).lineTo(0.5, -4.5)
			}
		];

		// where is the mesh going?
		const positions = [
			[2, -2, 0],
			[-4, -2, 0],
			[-4, 2, 0],
			[-2, 2, 0],
			[-2, 6, 0],
			[-8, 6, 0],
			[-8, -6, 0],
			[2, -6, 0]
		];

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Pane($$renderer, {
				position: 'fixed',
				title: 'outline effect',
				children: ($$renderer) => {
					Checkbox($$renderer, {
						label: 'paused',
						get value() {
							return paused;
						},

						set value($$value) {
							paused = $$value;
							$$settled = false;
						}
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Canvas($$renderer, {
				children: ($$renderer) => {
					Scene($$renderer, { play: !paused, mesh, walls, positions });
					$$renderer.push(`<!----> `);
					CustomRenderer($$renderer, { mesh });
					$$renderer.push(`<!---->`);
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