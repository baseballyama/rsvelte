import * as $ from 'svelte/internal/server';
import Scene from './Scene.svelte';
import { Canvas } from '@threlte/core';
import { Pane, Folder, List, Slider } from 'svelte-tweakpane-ui';

export default function App($$renderer) {
	let ballCount = 15;
	let isolation = 80;
	let planeAxis = 'y';
	let resolution = 35;
	const axisOptions = { x: 'x', y: 'y', z: 'z' };
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="svelte-1dv3gr2">`);

		Pane($$renderer, {
			position: 'fixed',
			title: 'Lava Lamp',
			children: ($$renderer) => {
				Slider($$renderer, {
					label: 'ball count',
					min: 3,
					max: 25,
					step: 1,
					get value() {
						return ballCount;
					},

					set value($$value) {
						ballCount = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Slider($$renderer, {
					label: 'isolation',
					min: 40,
					max: 100,
					step: 1,
					get value() {
						return isolation;
					},

					set value($$value) {
						isolation = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Slider($$renderer, {
					label: 'resolution',
					min: 10,
					max: 50,
					step: 1,
					get value() {
						return resolution;
					},

					set value($$value) {
						resolution = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Folder($$renderer, {
					title: 'Plane',
					children: ($$renderer) => {
						List($$renderer, {
							label: 'Axis',
							options: axisOptions,
							get value() {
								return planeAxis;
							},

							set value($$value) {
								planeAxis = $$value;
								$$settled = false;
							}
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Canvas($$renderer, {
			children: ($$renderer) => {
				Scene($$renderer, { ballCount, planeAxis, resolution, isolation });
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