import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';
import { Pane, Folder, Slider, List } from 'svelte-tweakpane-ui';
import * as easings from 'svelte/easing';

export default function App($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let size = 64;
		let maxAge = 750;
		let radius = 0.3;
		let intensity = 0.2;
		let interpolate = 0;
		let smoothing = 0;
		let minForce = 0.3;
		let amount = 0.1;
		let easeName = 'circOut';

		const easingOptions = {
			linear: 'linear',
			circOut: 'circOut',
			cubicOut: 'cubicOut',
			quadOut: 'quadOut',
			expoOut: 'expoOut',
			elasticOut: 'elasticOut',
			bounceOut: 'bounceOut'
		};

		const ease = $.derived(() => easings[easeName]);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="svelte-yy4h58">`);

			Pane($$renderer, {
				position: 'fixed',
				title: '',
				children: ($$renderer) => {
					Slider($$renderer, {
						label: 'size',
						min: 8,
						max: 256,
						step: 8,
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
						label: 'maxAge',
						min: 300,
						max: 1000,
						step: 50,
						get value() {
							return maxAge;
						},

						set value($$value) {
							maxAge = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'radius',
						min: 0,
						max: 1,
						step: 0.01,
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
						label: 'intensity',
						min: 0,
						max: 1,
						step: 0.1,
						get value() {
							return intensity;
						},

						set value($$value) {
							intensity = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'interpolate',
						min: 0,
						max: 2,
						step: 1,
						get value() {
							return interpolate;
						},

						set value($$value) {
							interpolate = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'smoothing',
						min: 0,
						max: 0.99,
						step: 0.01,
						get value() {
							return smoothing;
						},

						set value($$value) {
							smoothing = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'minForce',
						min: 0,
						max: 1,
						step: 0.1,
						get value() {
							return minForce;
						},

						set value($$value) {
							minForce = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					List($$renderer, {
						label: 'ease',
						options: easingOptions,
						get value() {
							return easeName;
						},

						set value($$value) {
							easeName = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Folder($$renderer, {
						title: 'Displacement',
						children: ($$renderer) => {
							Slider($$renderer, {
								label: 'amount',
								min: 0,
								max: 0.5,
								step: 0.01,
								get value() {
									return amount;
								},

								set value($$value) {
									amount = $$value;
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
					Scene($$renderer, {
						size,
						maxAge,
						radius,
						intensity,
						interpolate,
						smoothing,
						minForce,
						amount,
						ease: ease()
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
	});
}