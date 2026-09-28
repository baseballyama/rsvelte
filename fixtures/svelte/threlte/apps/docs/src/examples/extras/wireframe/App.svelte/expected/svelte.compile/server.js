import * as $ from 'svelte/internal/server';
import { Color } from 'three';
import { Pane, Checkbox, Slider, Color as ColorInput, Separator } from 'svelte-tweakpane-ui';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';

export default function App($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let wireframeProps = {
			thickness: 0.7,
			squeeze: true,
			squeezeMin: 0.2,
			squeezeMax: -0.13,
			dash: false,
			dashInvert: true,
			dashRepeats: 4,
			dashLength: 0.1,
			fill: new Color('lightgreen'),
			fillOpacity: 1,
			fillMix: 0,
			stroke: new Color('red'),
			strokeOpacity: 1,
			colorBackfaces: false,
			backfaceStroke: new Color('lightred')
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Pane($$renderer, {
				title: '',
				position: 'fixed',
				children: ($$renderer) => {
					Slider($$renderer, {
						label: 'thickness',
						min: 0,
						max: 20,
						step: 0.1,
						get value() {
							return wireframeProps.thickness;
						},

						set value($$value) {
							wireframeProps.thickness = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);
					Separator($$renderer, {});
					$$renderer.push(`<!----> `);

					Checkbox($$renderer, {
						label: 'squeeze',
						get value() {
							return wireframeProps.squeeze;
						},

						set value($$value) {
							wireframeProps.squeeze = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'squeezeMin',
						get value() {
							return wireframeProps.squeezeMin;
						},

						set value($$value) {
							wireframeProps.squeezeMin = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'squeezeMax',
						get value() {
							return wireframeProps.squeezeMax;
						},

						set value($$value) {
							wireframeProps.squeezeMax = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);
					Separator($$renderer, {});
					$$renderer.push(`<!----> `);

					Checkbox($$renderer, {
						label: 'dash',
						get value() {
							return wireframeProps.dash;
						},

						set value($$value) {
							wireframeProps.dash = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Checkbox($$renderer, {
						label: 'dashInvert',
						get value() {
							return wireframeProps.dashInvert;
						},

						set value($$value) {
							wireframeProps.dashInvert = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'dashLength',
						get value() {
							return wireframeProps.dashLength;
						},

						set value($$value) {
							wireframeProps.dashLength = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'dashRepeats',
						step: 1,
						get value() {
							return wireframeProps.dashRepeats;
						},

						set value($$value) {
							wireframeProps.dashRepeats = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);
					Separator($$renderer, {});
					$$renderer.push(`<!----> `);

					ColorInput($$renderer, {
						label: 'fill',
						type: 'float',
						get value() {
							return wireframeProps.fill;
						},

						set value($$value) {
							wireframeProps.fill = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'fillOpacity',
						get value() {
							return wireframeProps.fillOpacity;
						},

						set value($$value) {
							wireframeProps.fillOpacity = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'fillMix',
						step: 0.01,
						get value() {
							return wireframeProps.fillMix;
						},

						set value($$value) {
							wireframeProps.fillMix = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);
					Separator($$renderer, {});
					$$renderer.push(`<!----> `);

					ColorInput($$renderer, {
						label: 'stroke',
						type: 'float',
						get value() {
							return wireframeProps.stroke;
						},

						set value($$value) {
							wireframeProps.stroke = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'fillOpacity',
						get value() {
							return wireframeProps.strokeOpacity;
						},

						set value($$value) {
							wireframeProps.strokeOpacity = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					ColorInput($$renderer, {
						label: 'backfaceStroke',
						type: 'float',
						get value() {
							return wireframeProps.backfaceStroke;
						},

						set value($$value) {
							wireframeProps.backfaceStroke = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="svelte-1l3rqwu">`);

			Canvas($$renderer, {
				children: ($$renderer) => {
					Scene($$renderer, { wireframeProps });
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