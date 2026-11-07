import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Axis, LinearGradient, Layer, Spline } from 'layerchart';
import { curveBumpX } from 'd3-shape';
import { scaleLinear, scalePoint } from 'd3-scale';
import { cls } from '@layerstack/tailwind';

var root = $.from_svg(`<g><!></g>`);
var root_1 = $.from_svg(`<rect></rect><text text-anchor="middle" dominant-baseline="central" pointer-events="none"> </text>`, 1);
var root_2 = $.from_svg(`<!><!><!><!><!><!>`, 1);

export default function Bump_state_population_ranks($$anchor, $$props) {
	$.push($$props, true);

	const states = [
		{
			name: 'AK',
			ranks: [51, 51, 51, 51, 51, 51, 51, 50, 48, 47, 48]
		},

		{
			name: 'AL',
			ranks: [18, 15, 17, 17, 19, 21, 22, 22, 23, 23, 24]
		},

		{
			name: 'AR',
			ranks: [25, 25, 24, 31, 31, 32, 33, 33, 33, 32, 33]
		},

		{
			name: 'AZ',
			ranks: [46, 44, 44, 38, 35, 33, 29, 24, 20, 16, 14]
		},
		{ name: 'CA', ranks: [8, 6, 4, 2, 2, 1, 1, 1, 1, 1, 1] },
		{
			name: 'CO',
			ranks: [33, 33, 33, 34, 33, 30, 28, 26, 24, 22, 21]
		},

		{
			name: 'CT',
			ranks: [29, 29, 31, 28, 25, 24, 25, 27, 29, 29, 29]
		},

		{
			name: 'DC',
			ranks: [42, 41, 37, 36, 40, 41, 47, 48, 50, 50, 49]
		},

		{
			name: 'DE',
			ranks: [48, 48, 48, 48, 47, 47, 48, 46, 45, 45, 45]
		},
		{ name: 'FL', ranks: [32, 31, 25, 20, 10, 9, 7, 4, 4, 4, 3] },
		{
			name: 'GA',
			ranks: [12, 14, 14, 13, 16, 15, 13, 11, 10, 9, 8]
		},

		{
			name: 'HI',
			ranks: [47, 46, 46, 46, 44, 40, 39, 40, 42, 40, 40]
		},

		{
			name: 'IA',
			ranks: [17, 19, 20, 22, 24, 25, 27, 30, 30, 30, 31]
		},

		{
			name: 'ID',
			ranks: [43, 43, 43, 44, 43, 43, 41, 42, 39, 39, 38]
		},
		{ name: 'IL', ranks: [3, 3, 3, 4, 4, 5, 5, 6, 5, 5, 6] },
		{
			name: 'IN',
			ranks: [11, 11, 12, 11, 11, 11, 12, 14, 14, 15, 17]
		},

		{
			name: 'KS',
			ranks: [24, 24, 29, 30, 28, 28, 32, 32, 32, 33, 35]
		},

		{
			name: 'KY',
			ranks: [15, 16, 16, 19, 22, 23, 23, 23, 25, 26, 26]
		},

		{
			name: 'LA',
			ranks: [22, 22, 21, 21, 20, 20, 19, 21, 22, 25, 25]
		},
		{ name: 'MA', ranks: [6, 8, 8, 9, 9, 10, 11, 13, 13, 14, 15] },
		{
			name: 'MD',
			ranks: [28, 28, 28, 24, 21, 18, 18, 19, 19, 19, 18]
		},

		{
			name: 'ME',
			ranks: [35, 35, 35, 35, 36, 38, 38, 38, 40, 41, 42]
		},
		{ name: 'MI', ranks: [7, 7, 7, 7, 7, 7, 8, 8, 8, 8, 10] },
		{
			name: 'MN',
			ranks: [16, 18, 18, 18, 18, 19, 21, 20, 21, 21, 22]
		},

		{
			name: 'MO',
			ranks: [9, 10, 10, 12, 13, 13, 15, 15, 17, 18, 19]
		},

		{
			name: 'MS',
			ranks: [23, 23, 23, 26, 29, 29, 31, 31, 31, 31, 34]
		},

		{
			name: 'MT',
			ranks: [39, 39, 40, 43, 42, 44, 44, 44, 44, 44, 44]
		},

		{
			name: 'NC',
			ranks: [14, 12, 11, 10, 12, 12, 10, 10, 11, 10, 9]
		},

		{
			name: 'ND',
			ranks: [36, 38, 39, 42, 45, 46, 46, 47, 47, 48, 47]
		},

		{
			name: 'NE',
			ranks: [31, 32, 32, 33, 34, 35, 35, 36, 38, 38, 37]
		},

		{
			name: 'NH',
			ranks: [41, 42, 45, 45, 46, 42, 42, 41, 41, 42, 41]
		},
		{ name: 'NJ', ranks: [10, 9, 9, 8, 8, 8, 9, 9, 9, 11, 11] },
		{
			name: 'NM',
			ranks: [44, 45, 42, 40, 37, 37, 37, 37, 36, 36, 36]
		},

		{
			name: 'NV',
			ranks: [50, 50, 50, 50, 50, 48, 43, 39, 35, 35, 32]
		},
		{ name: 'NY', ranks: [1, 1, 1, 1, 1, 2, 2, 2, 3, 3, 4] },
		{ name: 'OH', ranks: [4, 4, 5, 5, 5, 6, 6, 7, 7, 7, 7] },
		{
			name: 'OK',
			ranks: [21, 21, 22, 25, 27, 27, 26, 28, 27, 28, 28]
		},

		{
			name: 'OR',
			ranks: [34, 34, 34, 32, 32, 31, 30, 29, 28, 27, 27]
		},
		{ name: 'PA', ranks: [2, 2, 2, 3, 3, 3, 4, 5, 6, 6, 5] },
		{
			name: 'RI',
			ranks: [38, 37, 36, 37, 39, 39, 40, 43, 43, 43, 43]
		},

		{
			name: 'SC',
			ranks: [26, 26, 27, 27, 26, 26, 24, 25, 26, 24, 23]
		},

		{
			name: 'SD',
			ranks: [37, 36, 38, 41, 41, 45, 45, 45, 46, 46, 46]
		},

		{
			name: 'TN',
			ranks: [20, 17, 15, 15, 17, 17, 17, 18, 16, 17, 16]
		},
		{ name: 'TX', ranks: [5, 5, 6, 6, 6, 4, 3, 3, 2, 2, 2] },
		{
			name: 'UT',
			ranks: [40, 40, 41, 39, 38, 36, 36, 35, 34, 34, 30]
		},

		{
			name: 'VA',
			ranks: [19, 20, 19, 16, 14, 14, 14, 12, 12, 12, 12]
		},

		{
			name: 'VT',
			ranks: [45, 47, 47, 47, 48, 49, 49, 49, 49, 49, 50]
		},

		{
			name: 'WA',
			ranks: [30, 30, 30, 23, 23, 22, 20, 17, 15, 13, 13]
		},

		{
			name: 'WI',
			ranks: [13, 13, 13, 14, 15, 16, 16, 16, 18, 20, 20]
		},

		{
			name: 'WV',
			ranks: [27, 27, 26, 29, 30, 34, 34, 34, 37, 37, 39]
		},

		{
			name: 'WY',
			ranks: [49, 49, 49, 49, 49, 50, 50, 51, 51, 51, 51]
		}
	];

	const years = [
		'1920',
		'1930',
		'1940',
		'1950',
		'1960',
		'1970',
		'1980',
		'1990',
		'2000',
		'2010',
		'2020'
	];

	const maxRank = 51;
	const rowHeight = 14;

	const data = years.map((year, i) => {
		const row = { year };

		for (const state of states) {
			row[state.name] = state.ranks[i];
		}

		return row;
	});

	const keys = states.map((s) => s.name);
	let hoveredState = $.state(null);
	var $$exports = { data };

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;

			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_2();
					var node = $.first_child(fragment_2);

					LinearGradient(node, {
						id: 'gradient-improved',
						stops: ['var(--color-success-700)', 'var(--color-success-300)']
					});

					var node_1 = $.sibling(node);

					LinearGradient(node_1, {
						id: 'gradient-declined',
						stops: ['var(--color-danger-300)', 'var(--color-danger-700)']
					});

					var node_2 = $.sibling(node_1);

					Axis(node_2, { placement: 'top', rule: false });

					var node_3 = $.sibling(node_2);

					Axis(node_3, { placement: 'bottom', rule: false });

					var node_4 = $.sibling(node_3);

					$.each(node_4, 17, () => states, (state) => state.name, ($$anchor, state) => {
						const dimmed = $.derived(() => $.get(hoveredState) !== null && $.get(hoveredState) !== $.get(state).name);
						var g = root();
						var node_5 = $.child(g);

						Spline(node_5, {
							get y() {
								return $.get(state).name;
							},

							get curve() {
								return curveBumpX;
							},

							stroke: (d, i, arr) => {
								if (i >= arr.length - 1) return 'color-mix(in srgb, var(--color-surface-content) 30%, transparent)';

								const from = d[$.get(state).name];
								const to = arr[i + 1][$.get(state).name];

								return from > to
									? 'url(#gradient-improved)'
									: from < to
										? 'url(#gradient-declined)'
										: 'color-mix(in srgb, var(--color-surface-content) 30%, transparent)';
							},
							strokeWidth: 4
						});

						$.reset(g);

						$.template_effect(($0) => $.set_class(g, 0, $0), [
							() => $.clsx(cls('transition-opacity duration-200', $.get(dimmed) && 'opacity-[0.15]'))
						]);

						$.event('mouseenter', g, () => $.set(hoveredState, $.get(state).name, true));
						$.append($$anchor, g);
					});

					var node_6 = $.sibling(node_4);

					$.each(node_6, 17, () => states, (state) => state.name, ($$anchor, state) => {
						const dimmed = $.derived(() => $.get(hoveredState) !== null && $.get(hoveredState) !== $.get(state).name);
						var fragment_3 = $.comment();
						var node_7 = $.first_child(fragment_3);

						$.each(node_7, 19, () => data, (point) => point.year, ($$anchor, point, i) => {
							const x = $.derived(() => context().xScale($.get(point).year));
							const y = $.derived(() => context().yScale($.get(point)[$.get(state).name]));
							const from = $.derived(() => $.get(state).ranks[$.get(i) === 0 ? 0 : $.get(i) - 1]);
							const to = $.derived(() => $.get(state).ranks[$.get(i) === 0 ? 1 : $.get(i)]);
							var fragment_4 = root_1();
							var rect = $.first_child(fragment_4);

							$.set_attribute(rect, 'width', 24);
							$.set_attribute(rect, 'height', rowHeight);

							var text = $.sibling(rect);
							var text_1 = $.only_child(text, true);

							$.template_effect(
								($0, $1) => {
									$.set_attribute(rect, 'x', $.get(x) - 12);
									$.set_attribute(rect, 'y', $.get(y) - rowHeight / 2);
									$.set_class(rect, 0, $0);
									$.set_attribute(text, 'x', $.get(x));
									$.set_attribute(text, 'y', $.get(y));
									$.set_class(text, 0, $1);
									$.set_text(text_1, $.get(state).name);
								},
								[
									() => $.clsx(cls('fill-surface-200 transition-opacity duration-200', $.get(dimmed) && '_opacity-10')),
									() => $.clsx(cls(
										'text-[12px] font-semibold font-[monospace] transition-opacity duration-200',
										$.get(from) > $.get(to)
											? 'fill-success'
											: $.get(from) < $.get(to) ? 'fill-danger' : 'fill-surface-content/50',
										$.get(dimmed) && 'opacity-10'
									))
								]
							);

							$.event('mouseenter', rect, () => $.set(hoveredState, $.get(state).name, true));
							$.event('mouseleave', rect, () => $.set(hoveredState, null));
							$.append($$anchor, fragment_4);
						});

						$.append($$anchor, fragment_3);
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		};

		let $0 = $.derived(scalePoint);
		let $1 = $.derived(scaleLinear);

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'year',
			get xScale() {
				return $.get($0);
			},

			get y() {
				return keys;
			},

			get yScale() {
				return $.get($1);
			},
			yDomain: [maxRank + 0.5, 0.5],
			padding: { top: 30, bottom: 30, left: 14, right: 18 },
			height: maxRank * rowHeight + 60,
			children,
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}