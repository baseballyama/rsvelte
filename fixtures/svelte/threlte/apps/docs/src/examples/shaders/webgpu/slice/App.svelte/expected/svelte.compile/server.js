import * as $ from 'svelte/internal/server';
import Scene from './Scene.svelte';
import { Canvas, extend } from '@threlte/core';
import { Checkbox, Color, Folder, Pane, Slider } from 'svelte-tweakpane-ui';
import { ACESFilmicToneMapping, MathUtils } from 'three';

import {
	DirectionalLight,
	MeshPhysicalNodeMaterial,
	MeshStandardMaterial,
	WebGPURenderer
} from 'three/webgpu';

export default function App($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		extend({
			DirectionalLight,
			MeshPhysicalNodeMaterial,
			MeshStandardMaterial
		});

		let arcAngleDegrees = 90;
		let startAngleDegrees = 60;
		let sliceColor = '#ff4500';
		let rotate = true;
		const arcAngle = $.derived(() => MathUtils.DEG2RAD * arcAngleDegrees);
		const startAngle = $.derived(() => MathUtils.DEG2RAD * startAngleDegrees);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Pane($$renderer, {
				position: 'fixed',
				title: 'slice shader',
				children: ($$renderer) => {
					Checkbox($$renderer, {
						label: 'rotate',
						get value() {
							return rotate;
						},

						set value($$value) {
							rotate = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Folder($$renderer, {
						title: 'uniforms',
						children: ($$renderer) => {
							Color($$renderer, {
								label: 'color',
								get value() {
									return sliceColor;
								},

								set value($$value) {
									sliceColor = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							Slider($$renderer, {
								min: 0,
								max: 360,
								step: 1,
								label: 'start angle (degrees)',
								get value() {
									return startAngleDegrees;
								},

								set value($$value) {
									startAngleDegrees = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							Slider($$renderer, {
								min: 0,
								max: 360,
								step: 1,
								label: 'arc angle (degrees)',
								get value() {
									return arcAngleDegrees;
								},

								set value($$value) {
									arcAngleDegrees = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Canvas($$renderer, {
				toneMapping: ACESFilmicToneMapping,
				createRenderer: (canvas) => {
					return new WebGPURenderer({ antialias: true, canvas, forceWebGL: false });
				},

				children: ($$renderer) => {
					Scene($$renderer, {
						rotate,
						arcAngle: arcAngle(),
						sliceColor,
						startAngle: startAngle()
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