import * as $ from 'svelte/internal/server';
import { scaleSequential } from 'd3-scale';

import {
	interpolateRainbow,
	interpolateSinebow,
	interpolateWarm,
	interpolateCool,
	interpolateInferno,
	interpolateViridis,
	interpolateMagma,
	interpolateTurbo,
	interpolateCividis,
	interpolateYlGnBu,
	interpolateSpectral,
	interpolatePlasma,
	interpolateCubehelixDefault,
	interpolateRdYlBu
} from 'd3-scale-chromatic';

import { Axis, Chart, Contour, Layer, Raster } from 'layerchart';
import { Field, MenuField, Switch } from 'svelte-ux';

export default function Math_functions($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const functions = [
			{
				label: 'atan2(y, x)',
				value: 'atan2',
				fn: (x, y) => Math.atan2(y, x)
			},

			{
				label: 'sin(x) * cos(y)',
				value: 'sincos',
				fn: (x, y) => Math.sin(x * Math.PI * 2) * Math.cos(y * Math.PI * 2)
			},

			{
				label: 'sin(x² + y²)',
				value: 'ripples',
				fn: (x, y) => Math.sin((x * x + y * y) * Math.PI * 6)
			},

			{
				label: 'x² - y²',
				value: 'saddle',
				fn: (x, y) => x * x - y * y
			},

			{
				label: 'sin(x * y)',
				value: 'sinxy',
				fn: (x, y) => Math.sin(x * y * Math.PI * 4)
			},

			{
				label: 'cos(r * 5π)',
				value: 'rings',
				fn: (x, y) => Math.cos(Math.sqrt(x * x + y * y) * Math.PI * 5)
			}
		];

		const interpolators = [
			{ label: 'Viridis', value: 'viridis', fn: interpolateViridis },
			{ label: 'Inferno', value: 'inferno', fn: interpolateInferno },
			{ label: 'Magma', value: 'magma', fn: interpolateMagma },
			{ label: 'Plasma', value: 'plasma', fn: interpolatePlasma },
			{ label: 'Cividis', value: 'cividis', fn: interpolateCividis },
			{ label: 'Turbo', value: 'turbo', fn: interpolateTurbo },
			{ label: 'Rainbow', value: 'rainbow', fn: interpolateRainbow },
			{ label: 'Sinebow', value: 'sinebow', fn: interpolateSinebow },
			{ label: 'Warm', value: 'warm', fn: interpolateWarm },
			{ label: 'Cool', value: 'cool', fn: interpolateCool },
			{
				label: 'Cubehelix',
				value: 'cubehelix',
				fn: interpolateCubehelixDefault
			},
			{ label: 'YlGnBu', value: 'ylgnbu', fn: interpolateYlGnBu },
			{
				label: 'Spectral',
				value: 'spectral',
				fn: interpolateSpectral
			},
			{ label: 'RdYlBu', value: 'rdylbu', fn: interpolateRdYlBu }
		];

		let selectedFn = functions[0].value;
		let selectedInterp = 'rainbow';
		let fn = $.derived(() => functions.find((f) => f.value === selectedFn));
		let interp = $.derived(() => interpolators.find((i) => i.value === selectedInterp));
		let showContours = false;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="grid gap-2"><div class="grid grid-cols-[1fr_1fr_auto] gap-2">`);

			MenuField($$renderer, {
				label: 'Function',
				options: functions,
				stepper: true,
				classes: { menuIcon: 'hidden' },
				get value() {
					return selectedFn;
				},

				set value($$value) {
					selectedFn = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			MenuField($$renderer, {
				label: 'Color',
				options: interpolators,
				stepper: true,
				classes: { menuIcon: 'hidden' },
				get value() {
					return selectedInterp;
				},

				set value($$value) {
					selectedInterp = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Field($$renderer, {
				label: 'Contours',
				children: ($$renderer) => {
					Switch($$renderer, {
						get checked() {
							return showContours;
						},

						set checked($$value) {
							showContours = $$value;
							$$settled = false;
						}
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			Chart($$renderer, {
				cScale: scaleSequential(interp().fn),
				xDomain: [-1, 1],
				yDomain: [-1, 1],
				padding: { left: 30, bottom: 24, top: 8, right: 8 },
				height: 400,
				children: ($$renderer) => {
					Layer($$renderer, {
						children: ($$renderer) => {
							Axis($$renderer, { placement: 'left', grid: true, rule: true });
							$$renderer.push(`<!----> `);
							Axis($$renderer, { placement: 'bottom', rule: true });
							$$renderer.push(`<!----> `);
							Raster($$renderer, { value: fn().fn });
							$$renderer.push(`<!----> `);

							if (showContours) {
								$$renderer.push('<!--[0-->');

								Contour($$renderer, {
									value: fn().fn,
									fill: 'none',
									stroke: 'white',
									strokeWidth: 0.5,
									strokeOpacity: 0.7,
									thresholds: 20
								});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
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