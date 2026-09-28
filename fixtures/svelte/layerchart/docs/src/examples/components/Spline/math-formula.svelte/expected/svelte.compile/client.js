import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="grid gap-2 mb-4"><div class="grid grid-cols-[1fr_1fr] gap-2"><!> <!></div> <div class="grid grid-cols-[auto_1fr] gap-2"><!> <!></div></div> <!>`, 1);

export default function Math_formula($$anchor, $$props) {
	$.push($$props, true);

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
	let selected = $.state('x^2');
	let customFormula = $.state('');
	let showRaster = $.state(false);
	let evaluateFn = $.state(null);

	$.user_effect(() => {
		if (browser) {
			import('mathjs').then((m) => {
				$.set(evaluateFn, m.evaluate, true);
			});
		}
	});

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

	let selectedInterp = $.state('viridis');
	let interp = $.derived(() => interpolators.find((i) => i.value === $.get(selectedInterp)));
	const formula = $.derived(() => $.get(selected) === 'custom' ? $.get(customFormula) : $.get(selected));

	const $$d = $.derived(() => computeGraph($.get(formula), $.get(evaluateFn))),
		data = $.derived(() => $.get($$d).data),
		error = $.derived(() => $.get($$d).error);

	const rasterValue = $.derived(() => {
		const f = $.get(formula);
		const eval_ = $.get(evaluateFn);

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

	var fragment = root_1();
	var div = $.first_child(fragment);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	MenuField(node, {
		label: 'Formula',
		get options() {
			return options;
		},
		stepper: true,
		classes: { menuIcon: 'hidden' },
		get value() {
			return $.get(selected);
		},

		set value($$value) {
			$.set(selected, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => $.get(selected) === 'custom' && $.get(customFormula) && $.get(error) ? $.get(error) : false);
		let $1 = $.derived(() => $.get(selected) !== 'custom');

		TextField(node_1, {
			label: 'Custom',
			placeholder: 'e.g. tan(x) or x^3 - x',
			get error() {
				return $.get($0);
			},

			get disabled() {
				return $.get($1);
			},
			onfocusin: () => $.set(selected, 'custom'),
			get value() {
				return $.get(customFormula);
			},

			set value($$value) {
				$.set(customFormula, $$value, true);
			}
		});
	}

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_2 = $.child(div_2);

	Field(node_2, {
		label: 'Raster',
		children: ($$anchor, $$slotProps) => {
			Switch($$anchor, {
				get checked() {
					return $.get(showRaster);
				},

				set checked($$value) {
					$.set(showRaster, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	{
		let $0 = $.derived(() => !$.get(showRaster));

		MenuField(node_3, {
			label: 'Color',
			get options() {
				return interpolators;
			},

			get disabled() {
				return $.get($0);
			},
			stepper: true,
			classes: { menuIcon: 'hidden' },
			get value() {
				return $.get(selectedInterp);
			},

			set value($$value) {
				$.set(selectedInterp, $$value, true);
			}
		});
	}

	$.reset(div_2);
	$.reset(div);

	var node_4 = $.sibling(div, 2);

	{
		const marks = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_2 = root();
			var node_5 = $.first_child(fragment_2);

			{
				var consequent = ($$anchor) => {
					Raster($$anchor, {
						get value() {
							return $.get(rasterValue);
						},
						opacity: 0.5
					});
				};

				$.if(node_5, ($$render) => {
					if ($.get(showRaster)) $$render(consequent);
				});
			}

			var node_6 = $.sibling(node_5, 2);

			$.each(node_6, 17, () => context().series.visibleSeries, (s) => s.key, ($$anchor, s) => {
				Spline($$anchor, {
					get seriesKey() {
						return $.get(s).key;
					}
				});
			});

			$.append($$anchor, fragment_2);
		};

		const tooltip = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_5 = $.comment();
			var node_7 = $.first_child(fragment_5);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_6 = $.comment();
					var node_8 = $.first_child(fragment_6);

					$.component(node_8, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_7 = root();
								var node_9 = $.first_child(fragment_7);

								{
									let $0 = $.derived(() => format(context().x(data()), 'decimal'));

									$.component(node_9, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
										Tooltip_Item($$anchor, {
											label: 'x',
											get value() {
												return $.get($0);
											}
										});
									});
								}

								var node_10 = $.sibling(node_9, 2);

								{
									let $0 = $.derived(() => format(context().y(data()), 'decimal'));

									$.component(node_10, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
										Tooltip_Item_1($$anchor, {
											label: 'y',
											get value() {
												return $.get($0);
											}
										});
									});
								}

								$.append($$anchor, fragment_7);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_6);
				};

				$.component(node_7, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_5);
		};

		let $0 = $.derived(() => $.get(showRaster) ? scaleSequential($.get(interp).fn) : undefined);
		let $1 = $.derived(() => defaultChartPadding({ left: 45, right: 45 }));

		LineChart(node_4, {
			get data() {
				return $.get(data);
			},
			x: 'x',
			y: 'y',
			get cScale() {
				return $.get($0);
			},
			props: { yAxis: { rule: true } },
			clip: true,
			yNice: true,
			height: 400,
			get padding() {
				return $.get($1);
			},
			marks,
			tooltip,
			$$slots: { marks: true, tooltip: true }
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}