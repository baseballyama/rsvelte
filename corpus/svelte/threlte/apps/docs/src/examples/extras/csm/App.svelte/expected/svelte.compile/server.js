import * as $ from 'svelte/internal/server';
import { Pane, Slider, Checkbox, Color } from 'svelte-tweakpane-ui';
import { Canvas, T } from '@threlte/core';
import { CSM } from '@threlte/extras';
import Scene from './Scene.svelte';

export default function App($$renderer) {
	let enabled = true;
	let lightDirection = { x: 1, y: -1, z: 1 };
	let lightIntensity = Math.PI;
	let lightColor = '#fffceb';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Pane($$renderer, {
			title: 'CSM',
			position: 'fixed',
			children: ($$renderer) => {
				Checkbox($$renderer, {
					label: 'CSM enabled',
					get value() {
						return enabled;
					},

					set value($$value) {
						enabled = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!---->  `);

				Slider($$renderer, {
					label: 'lightIntensity',
					min: 0,
					max: 10,
					get value() {
						return lightIntensity;
					},

					set value($$value) {
						lightIntensity = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Color($$renderer, {
					label: 'lightColor',
					get value() {
						return lightColor;
					},

					set value($$value) {
						lightColor = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="svelte-1ldcvyn">`);

		Canvas($$renderer, {
			children: ($$renderer) => {
				{
					function fallback($$renderer) {
						if (T.DirectionalLight) {
							$$renderer.push('<!--[-->');
							T.DirectionalLight($$renderer, { castShadow: false });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}

					CSM($$renderer, {
						enabled,
						lightDirection: [lightDirection.x, lightDirection.y, lightDirection.z],
						lightIntensity,
						lightColor,
						fallback,
						children: ($$renderer) => {
							Scene($$renderer, {});
						},
						$$slots: { fallback: true, default: true }
					});
				}
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