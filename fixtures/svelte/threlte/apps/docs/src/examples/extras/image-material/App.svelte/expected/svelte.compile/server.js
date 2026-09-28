import * as $ from 'svelte/internal/server';
import Scene from './Scene.svelte';
import { Canvas } from '@threlte/core';
import { Checkbox, Color, Folder, Pane, Slider } from 'svelte-tweakpane-ui';

export default function App($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let brightness = 0;
		let contrast = 0;
		let negative = false;
		let hue = 0;
		let saturation = 0;
		let lightness = 0;
		let monochromeColor = '#ed8922';
		let monochromeStrength = 0;
		let textureOverrideEnabled = false;
		let alphaThreshold = 0.5;
		let alphaSmoothing = 0.15;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Canvas($$renderer, {
				children: ($$renderer) => {
					Scene($$renderer, {
						alphaSmoothing,
						alphaThreshold,
						brightness,
						contrast,
						hue,
						lightness,
						monochromeColor,
						monochromeStrength,
						negative,
						saturation,
						textureOverrideEnabled
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Pane($$renderer, {
				title: 'Image',
				position: 'fixed',
				children: ($$renderer) => {
					Folder($$renderer, {
						title: 'Color processing',
						children: ($$renderer) => {
							Slider($$renderer, {
								label: 'brightness',
								min: -1,
								max: 1,
								get value() {
									return brightness;
								},

								set value($$value) {
									brightness = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							Slider($$renderer, {
								label: 'contrast',
								min: -1,
								max: 1,
								get value() {
									return contrast;
								},

								set value($$value) {
									contrast = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							Slider($$renderer, {
								label: 'hue',
								min: 0,
								max: 1,
								get value() {
									return hue;
								},

								set value($$value) {
									hue = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							Slider($$renderer, {
								label: 'saturation',
								min: -1,
								max: 1,
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
								min: -1,
								max: 1,
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
								label: 'monochromeStrength',
								min: 0,
								max: 1,
								get value() {
									return monochromeStrength;
								},

								set value($$value) {
									monochromeStrength = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							Color($$renderer, {
								label: 'monochromeColor',
								get value() {
									return monochromeColor;
								},

								set value($$value) {
									monochromeColor = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							Checkbox($$renderer, {
								label: 'negative',
								get value() {
									return negative;
								},

								set value($$value) {
									negative = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Folder($$renderer, {
						title: 'Color processing with a texture',
						children: ($$renderer) => {
							Checkbox($$renderer, {
								label: 'enabled',
								get value() {
									return textureOverrideEnabled;
								},

								set value($$value) {
									textureOverrideEnabled = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							Slider($$renderer, {
								label: 'alphaThreshold',
								min: 0,
								max: 1,
								get value() {
									return alphaThreshold;
								},

								set value($$value) {
									alphaThreshold = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							Slider($$renderer, {
								label: 'alphaSmoothing',
								min: 0,
								max: 1,
								get value() {
									return alphaSmoothing;
								},

								set value($$value) {
									alphaSmoothing = $$value;
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