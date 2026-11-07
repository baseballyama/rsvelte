import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import { Checkbox, Pane, Slider, Textarea } from 'svelte-tweakpane-ui';
import Scene from './Scene.svelte';
import { MathUtils } from 'three';

export default function App($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let options = {
			text: 'Hello\nWorld',
			bevelEnabled: true,
			bevelOffset: 0,
			bevelSegments: 20,
			bevelSize: 0.2,
			bevelThickness: 0.1,
			curveSegments: 12,
			depth: 1,
			size: 5,
			smooth: 0.1
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Pane($$renderer, {
				title: 'Text3DGeometry',
				position: 'fixed',
				children: ($$renderer) => {
					Textarea($$renderer, {
						label: 'text',
						get value() {
							return options.text;
						},

						set value($$value) {
							options.text = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Checkbox($$renderer, {
						label: 'bevelEnabled',
						get value() {
							return options.bevelEnabled;
						},

						set value($$value) {
							options.bevelEnabled = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'bevelOffset',
						min: 0,
						max: 2,
						get value() {
							return options.bevelOffset;
						},

						set value($$value) {
							options.bevelOffset = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'bevelSegments',
						step: 1,
						min: 0,
						max: 50,
						get value() {
							return options.bevelSegments;
						},

						set value($$value) {
							options.bevelSegments = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'bevelSize',
						min: 0,
						max: 2,
						get value() {
							return options.bevelSize;
						},

						set value($$value) {
							options.bevelSize = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'bevelThickness',
						min: 0,
						max: 2,
						get value() {
							return options.bevelThickness;
						},

						set value($$value) {
							options.bevelThickness = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'curveSegments',
						step: 1,
						min: 0,
						max: 50,
						get value() {
							return options.curveSegments;
						},

						set value($$value) {
							options.curveSegments = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'depth',
						min: 0,
						max: 5,
						get value() {
							return options.depth;
						},

						set value($$value) {
							options.depth = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'size',
						min: 0,
						max: 10,
						get value() {
							return options.size;
						},

						set value($$value) {
							options.size = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'smooth',
						min: 0,
						max: MathUtils.degToRad(180),
						get value() {
							return options.smooth;
						},

						set value($$value) {
							options.smooth = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="svelte-12n28bw">`);

			Canvas($$renderer, {
				children: ($$renderer) => {
					Scene($$renderer, $.spread_props([options]));
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