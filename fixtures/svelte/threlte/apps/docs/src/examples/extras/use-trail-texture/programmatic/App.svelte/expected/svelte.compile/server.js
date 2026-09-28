import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';
import { Pane, Slider, List } from 'svelte-tweakpane-ui';
import * as easings from 'svelte/easing';

export default function App($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let size = 256;
		let maxAge = 5000;
		let radius = 0.05;
		let intensity = 1;
		let interpolate = 2;
		let smoothing = 0.9;
		let minForce = 0;
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
			$$renderer.push(`<div class="svelte-13euj7f">`);

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
						max: 5000,
						step: 100,
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
						max: 5,
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