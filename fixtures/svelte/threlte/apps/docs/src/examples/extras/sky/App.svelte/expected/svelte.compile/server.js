import * as $ from 'svelte/internal/server';
import Scene from './Scene.svelte';
import { Canvas } from '@threlte/core';
import { Pane, Slider, Checkbox, Button, Folder } from 'svelte-tweakpane-ui';
import { Sky } from '@threlte/extras';
import { Spring } from 'svelte/motion';
import { presets } from './presets';

export default function App($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const entries = Object.entries(presets);
		let setEnvironment = true;
		let azimuth = 0;
		let elevation = 0;
		let exposure = 0;
		let mieCoefficient = 0;
		let mieDirectionalG = 0;
		let rayleigh = 0;
		let turbidity = 0;

		const presetSpring = Spring.of(
			() => ({
				azimuth,
				elevation,
				exposure,
				mieCoefficient,
				mieDirectionalG,
				rayleigh,
				turbidity
			}),
			{ damping: 0.95, precision: 0.0001, stiffness: 0.05 }
		);

		const applyPreset = (preset) => {
			azimuth = preset.azimuth;
			elevation = preset.elevation;
			exposure = preset.exposure;
			mieCoefficient = preset.mieCoefficient;
			mieDirectionalG = preset.mieDirectionalG;
			rayleigh = preset.rayleigh;
			turbidity = preset.turbidity;
		};

		applyPreset(presets.sunset);

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Pane($$renderer, {
				title: 'Sky',
				position: 'fixed',
				children: ($$renderer) => {
					Checkbox($$renderer, {
						label: 'Set Environment',
						get value() {
							return setEnvironment;
						},

						set value($$value) {
							setEnvironment = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'Turbidity',
						min: 0,
						max: 20,
						get value() {
							return turbidity;
						},

						set value($$value) {
							turbidity = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'Rayleigh',
						min: 0,
						max: 4,
						get value() {
							return rayleigh;
						},

						set value($$value) {
							rayleigh = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'Azimuth',
						min: -180,
						max: 180,
						get value() {
							return azimuth;
						},

						set value($$value) {
							azimuth = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'Elevation',
						min: -5,
						max: 90,
						get value() {
							return elevation;
						},

						set value($$value) {
							elevation = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'Mie Coefficient',
						min: 0,
						max: 0.1,
						get value() {
							return mieCoefficient;
						},

						set value($$value) {
							mieCoefficient = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'Mie Directional G',
						min: 0,
						max: 1,
						get value() {
							return mieDirectionalG;
						},

						set value($$value) {
							mieDirectionalG = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'Exposure',
						min: 0,
						max: 2,
						get value() {
							return exposure;
						},

						set value($$value) {
							exposure = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Folder($$renderer, {
						title: 'Presets',
						children: ($$renderer) => {
							$$renderer.push(`<!--[-->`);

							const each_array = $.ensure_array_like(entries);

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let [title, preset] = each_array[$$index];

								Button($$renderer, { title });
							}

							$$renderer.push(`<!--]-->`);
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
					Sky($$renderer, $.spread_props([{ setEnvironment }, presetSpring.current]));
					$$renderer.push(`<!----> `);
					Scene($$renderer, { exposure: presetSpring.current.exposure });
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