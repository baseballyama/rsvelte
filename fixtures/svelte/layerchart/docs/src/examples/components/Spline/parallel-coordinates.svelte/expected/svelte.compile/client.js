import 'svelte/internal/disclose-version';
import { getPenguins } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Group, Legend, Spline, Text, pivotLonger } from 'layerchart';
import { extent } from 'd3-array';
import { scaleLinear, scalePoint } from 'd3-scale';

const penguins = await getPenguins();
var root = $.from_html(`<!> <!>`, 1);

export default function Parallel_coordinates($$anchor, $$props) {
	$.push($$props, true);

	const dimensions = {
		bill_length_mm: 'Bill length',
		bill_depth_mm: 'Bill depth',
		flipper_length_mm: 'Flipper length',
		body_mass_g: 'Body mass'
	};

	const keys = Object.keys(dimensions);
	const rows = penguins.filter((d) => keys.every((k) => d[k] !== 'NA')).map((d, id) => ({ ...d, id }));

	// One scale per dimension. Its default `0–1` range positions the lines on the chart's shared
	// `y`, and a pixel-ranged copy draws that dimension's axis in real units.
	const scales = new Map(keys.map((k) => [k, scaleLinear().domain(extent(rows, (d) => d[k]))]));

	// One row per (penguin, dimension), carrying `id` and `species` along for `z` and the color
	const data = pivotLonger(rows, keys, 'dimension', 'value');

	const series = [
		{ key: 'Adelie', color: 'var(--color-info)' },
		{ key: 'Chinstrap', color: 'var(--color-warning)' },
		{ key: 'Gentoo', color: 'var(--color-success)' }
	];

	var $$exports = { data };

	{
		const legend = ($$anchor) => {
			Legend($$anchor, {
				variant: 'swatches',
				placement: 'top-left',
				orientation: 'horizontal'
			});
		};

		const axis = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_2 = $.comment();
			var node = $.first_child(fragment_2);

			$.each(node, 16, () => keys, (key) => key, ($$anchor, key) => {
				{
					let $0 = $.derived(() => context().xScale(key));

					Group($$anchor, {
						get x() {
							return $.get($0);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root();
							var node_1 = $.first_child(fragment_4);

							{
								let $0 = $.derived(() => scales.get(key)?.copy().range([context().height, 0]));

								Axis(node_1, {
									placement: 'left',
									get scale() {
										return $.get($0);
									},
									ticks: 6,
									rule: true
								});
							}

							var node_2 = $.sibling(node_1, 2);

							Text(node_2, {
								get value() {
									return dimensions[key];
								},
								y: -12,
								textAnchor: 'middle',
								class: 'text-xs font-medium fill-surface-content'
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				}
			});

			$.append($$anchor, fragment_2);
		};

		const marks = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;

			{
				let $0 = $.derived(() => data.filter((d) => context().series.isVisible(d.species)));

				Spline($$anchor, {
					get data() {
						return $.get($0);
					},
					stroke: 'species',
					strokeWidth: 1,
					opacity: (d) => context().series.isHighlighted(d.species, true) ? 0.4 : 0.05
				});
			}
		};

		let $0 = $.derived(scalePoint);

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'dimension',
			get xScale() {
				return $.get($0);
			},

			get xDomain() {
				return keys;
			},
			y: (d) => scales.get(d.dimension)?.(d.value),
			yDomain: [0, 1],
			z: 'id',
			get series() {
				return series;
			},
			padding: { left: 48, right: 48, top: 48, bottom: 8 },
			height: 400,
			legend,
			axis,
			marks,
			$$slots: { legend: true, axis: true, marks: true }
		});
	}

	return $.pop($$exports);
}