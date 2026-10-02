import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="grid gap-2"><div class="grid grid-cols-[1fr_1fr_auto] gap-2"><!> <!> <!></div> <!></div>`);

export default function Math_functions($$anchor, $$props) {
	$.push($$props, true);

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

	let selectedFn = $.state($.proxy(functions[0].value));
	let selectedInterp = $.state('rainbow');
	let fn = $.derived(() => functions.find((f) => f.value === $.get(selectedFn)));
	let interp = $.derived(() => interpolators.find((i) => i.value === $.get(selectedInterp)));
	let showContours = $.state(false);
	var div = root_1();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	MenuField(node, {
		label: 'Function',
		get options() {
			return functions;
		},
		stepper: true,
		classes: { menuIcon: 'hidden' },
		get value() {
			return $.get(selectedFn);
		},

		set value($$value) {
			$.set(selectedFn, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	MenuField(node_1, {
		label: 'Color',
		get options() {
			return interpolators;
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

	var node_2 = $.sibling(node_1, 2);

	Field(node_2, {
		label: 'Contours',
		children: ($$anchor, $$slotProps) => {
			Switch($$anchor, {
				get checked() {
					return $.get(showContours);
				},

				set checked($$value) {
					$.set(showContours, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var node_3 = $.sibling(div_1, 2);

	{
		let $0 = $.derived(() => scaleSequential($.get(interp).fn));

		Chart(node_3, {
			get cScale() {
				return $.get($0);
			},
			xDomain: [-1, 1],
			yDomain: [-1, 1],
			padding: { left: 30, bottom: 24, top: 8, right: 8 },
			height: 400,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_4 = $.first_child(fragment_2);

						Axis(node_4, { placement: 'left', grid: true, rule: true });

						var node_5 = $.sibling(node_4, 2);

						Axis(node_5, { placement: 'bottom', rule: true });

						var node_6 = $.sibling(node_5, 2);

						Raster(node_6, {
							get value() {
								return $.get(fn).fn;
							}
						});

						var node_7 = $.sibling(node_6, 2);

						{
							var consequent = ($$anchor) => {
								Contour($$anchor, {
									get value() {
										return $.get(fn).fn;
									},
									fill: 'none',
									stroke: 'white',
									strokeWidth: 0.5,
									strokeOpacity: 0.7,
									thresholds: 20
								});
							};

							$.if(node_7, ($$render) => {
								if ($.get(showContours)) $$render(consequent);
							});
						}

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}