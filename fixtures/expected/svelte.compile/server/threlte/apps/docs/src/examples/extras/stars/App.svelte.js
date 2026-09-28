import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import { Checkbox, Folder, Pane, Slider } from 'svelte-tweakpane-ui';
import Scene from './Scene.svelte';

export default function App($$renderer) {
	let count = 5000;
	let radius = 50;
	let depth = 50;
	let factor = 6;
	let saturation = 1;
	let lightness = 0.8;
	let opacity = 1;
	let fade = true;
	let rounded = false;
	let speed = 0;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Pane($$renderer, {
			title: 'Stars',
			position: 'fixed',
			children: ($$renderer) => {
				Folder($$renderer, {
					title: 'Distribution',
					children: ($$renderer) => {
						Slider($$renderer, {
							label: 'count',
							min: 100,
							max: 20000,
							step: 100,
							get value() {
								return count;
							},

							set value($$value) {
								count = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						Slider($$renderer, {
							label: 'radius',
							min: 1,
							max: 200,
							step: 1,
							get value() {
								return radius;
							},

							set value($$value) {
								radius = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						Slider($$renderer, {
							label: 'depth',
							min: 1,
							max: 200,
							step: 1,
							get value() {
								return depth;
							},

							set value($$value) {
								depth = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Folder($$renderer, {
					title: 'Appearance',
					children: ($$renderer) => {
						Slider($$renderer, {
							label: 'factor',
							min: 0,
							max: 20,
							step: 0.1,
							get value() {
								return factor;
							},

							set value($$value) {
								factor = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						Slider($$renderer, {
							label: 'saturation',
							min: 0,
							max: 1,
							step: 0.01,
							get value() {
								return saturation;
							},

							set value($$value) {
								saturation = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						Slider($$renderer, {
							label: 'lightness',
							min: 0,
							max: 1,
							step: 0.01,
							get value() {
								return lightness;
							},

							set value($$value) {
								lightness = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						Slider($$renderer, {
							label: 'opacity',
							min: 0,
							max: 1,
							step: 0.01,
							get value() {
								return opacity;
							},

							set value($$value) {
								opacity = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						Checkbox($$renderer, {
							label: 'fade',
							get value() {
								return fade;
							},

							set value($$value) {
								fade = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						Checkbox($$renderer, {
							label: 'rounded',
							get value() {
								return rounded;
							},

							set value($$value) {
								rounded = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Folder($$renderer, {
					title: 'Animation',
					children: ($$renderer) => {
						Slider($$renderer, {
							label: 'speed',
							min: 0,
							max: 5,
							step: 0.1,
							get value() {
								return speed;
							},

							set value($$value) {
								speed = $$value;
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

		$$renderer.push(`<!----> <div class="svelte-8wusir">`);

		Canvas($$renderer, {
			children: ($$renderer) => {
				Scene($$renderer, {
					count,
					radius,
					depth,
					factor,
					saturation,
					lightness,
					opacity,
					fade,
					rounded,
					speed
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