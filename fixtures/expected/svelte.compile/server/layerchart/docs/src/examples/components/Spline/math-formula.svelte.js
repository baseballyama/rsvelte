import * as $ from 'svelte/internal/server';
import { defaultChartPadding, LineChart, Raster, Spline, Tooltip } from 'layerchart';
import { Field, MenuField, Switch, TextField } from 'svelte-ux';
import { format } from '@layerstack/utils';
import { browser } from '$app/environment';
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

export default function Math_formula($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const options = [
			{ label: 'x²', value: 'x^2' },
			{ label: 'log(x)', value: 'log(x)' },
			{ label: '(x²-4)/(x-2)', value: '(x^2-4)/(x-2)' },
			{ label: '2ˣ', value: '2^x' },
			{ label: 'x³ - 2x', value: 'x^3 - 2*x' },
			{ label: 'sin(x)', value: 'sin(x)' },
			{ label: 'sqrt(x)', value: 'sqrt(x)' },
			{ label: 'abs(x) - 3', value: 'abs(x) - 3' },
			{ label: 'Custom', value: 'custom' }
		];

		const xs = Array.from({ length: 100 }, (_, i) => -8 + i * 0.2);
		let selected = 'x^2';
		let customFormula = '';
		let showRaster = false;
		let evaluateFn = null;

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

		let selectedInterp = 'viridis';
		let interp = $.derived(() => interpolators.find((i) => i.value === selectedInterp));
		const formula = $.derived(() => selected === 'custom' ? customFormula : selected);

		const $$d = $.derived(() => computeGraph(formula(), evaluateFn)),
			data = $.derived(() => $$d().data),
			error = $.derived(() => $$d().error);

		const rasterValue = $.derived(() => {
			const f = formula();
			const eval_ = evaluateFn;

			if (!f?.trim() || !eval_) return (_x, _y) => 0;

			return (x, _y) => {
				try {
					const y = eval_(f, { x });

					return isFinite(y) ? y : NaN;
				} catch {
					return NaN;
				}
			};
		});

		function computeGraph(formula, eval_) {
			if (!formula?.trim() || !eval_) return { data: [], error: null };

			try {
				const data = xs.flatMap((x) => {
					try {
						const y = eval_(formula, { x });

						return isFinite(y) && Math.abs(y) < 1e6 ? [{ x, y }] : [];
					} catch {
						return [];
					}
				});

				return data.length === 0
					? { data: [], error: 'No valid points — check domain' }
					: { data, error: null };
			} catch(err) {
				return {
					data: [],
					error: err instanceof Error ? err.message : String(err)
				};
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="grid gap-2 mb-4"><div class="grid grid-cols-[1fr_1fr] gap-2">`);

			MenuField($$renderer, {
				label: 'Formula',
				options,
				stepper: true,
				classes: { menuIcon: 'hidden' },
				get value() {
					return selected;
				},

				set value($$value) {
					selected = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			TextField($$renderer, {
				label: 'Custom',
				placeholder: 'e.g. tan(x) or x^3 - x',
				error: selected === 'custom' && customFormula && error() ? error() : false,
				disabled: selected !== 'custom',
				onfocusin: () => selected = 'custom',
				get value() {
					return customFormula;
				},

				set value($$value) {
					customFormula = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div class="grid grid-cols-[auto_1fr] gap-2">`);

			Field($$renderer, {
				label: 'Raster',
				children: ($$renderer) => {
					Switch($$renderer, {
						get checked() {
							return showRaster;
						},

						set checked($$value) {
							showRaster = $$value;
							$$settled = false;
						}
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			MenuField($$renderer, {
				label: 'Color',
				options: interpolators,
				disabled: !showRaster,
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

			$$renderer.push(`<!----></div></div> `);

			{
				function marks($$renderer, { context }) {
					if (showRaster) {
						$$renderer.push('<!--[0-->');
						Raster($$renderer, { value: rasterValue(), opacity: 0.5 });
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> <!--[-->`);

					const each_array = $.ensure_array_like(context.series.visibleSeries);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let s = each_array[$$index];

						Spline($$renderer, { seriesKey: s.key });
					}

					$$renderer.push(`<!--]-->`);
				}

				function tooltip($$renderer, { context }) {
					{
						function children($$renderer, { data }) {
							if (Tooltip.List) {
								$$renderer.push('<!--[-->');

								Tooltip.List($$renderer, {
									children: ($$renderer) => {
										if (Tooltip.Item) {
											$$renderer.push('<!--[-->');
											Tooltip.Item($$renderer, { label: 'x', value: format(context.x(data), 'decimal') });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Tooltip.Item) {
											$$renderer.push('<!--[-->');
											Tooltip.Item($$renderer, { label: 'y', value: format(context.y(data), 'decimal') });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						if (Tooltip.Root) {
							$$renderer.push('<!--[-->');
							Tooltip.Root($$renderer, { children, $$slots: { default: true } });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}
				}

				LineChart($$renderer, {
					data: data(),
					x: 'x',
					y: 'y',
					cScale: showRaster ? scaleSequential(interp().fn) : undefined,
					props: { yAxis: { rule: true } },
					clip: true,
					yNice: true,
					height: 400,
					padding: defaultChartPadding({ left: 45, right: 45 }),
					marks,
					tooltip,
					$$slots: { marks: true, tooltip: true }
				});
			}

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