import 'svelte/internal/disclose-version';
import { getPenguins } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Group, Spline, pivotLonger } from 'layerchart';
import { extent } from 'd3-array';
import { scaleLinear, scalePoint } from 'd3-scale';

const penguins = await getPenguins();
var root = $.from_html(`<!> <!>`, 1);

export default function Parallel_coordinates_faceted($$anchor, $$props) {
	$.push($$props, true);

	const dimensions = {
		bill_length_mm: 'Bill length',
		bill_depth_mm: 'Bill depth',
		flipper_length_mm: 'Flipper length',
		body_mass_g: 'Body mass'
	};

	const keys = Object.keys(dimensions);
	const rows = penguins.filter((d) => keys.every((k) => d[k] !== 'NA')).map((d, id) => ({ ...d, id }));

	// Domains span every species, so the panels stay comparable — see `parallel-coordinates`
	const scales = new Map(keys.map((k) => [k, scaleLinear().domain(extent(rows, (d) => d[k]))]));

	const data = pivotLonger(rows, keys, 'dimension', 'value');

	const series = [
		{ key: 'Adelie', color: 'var(--color-info)' },
		{ key: 'Chinstrap', color: 'var(--color-warning)' },
		{ key: 'Gentoo', color: 'var(--color-success)' }
	];

	var $$exports = { data };

	{
		const axis = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Axis(node, {
				placement: 'top',
				format: (d) => dimensions[d],
				tickLength: 0
			});

			var node_1 = $.sibling(node, 2);

			$.each(node_1, 16, () => keys, (key) => key, ($$anchor, key) => {
				{
					let $0 = $.derived(() => context().xScale(key));

					Group($$anchor, {
						get x() {
							return $.get($0);
						},

						children: ($$anchor, $$slotProps) => {
							{
								let $0 = $.derived(() => scales.get(key)?.copy().range([context().height, 0]));

								Axis($$anchor, {
									placement: 'left',
									get scale() {
										return $.get($0);
									},
									ticks: 6,
									rule: true,
									facetAll: true
								});
							}
						},
						$$slots: { default: true }
					});
				}
			});

			$.append($$anchor, fragment_1);
		};

		const marks = ($$anchor) => {
			Spline($$anchor, { stroke: 'species', strokeWidth: 1, opacity: 0.4 });
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
			fy: 'species',
			get series() {
				return series;
			},
			padding: { left: 48, right: 76, top: 32, bottom: 8 },
			height: 560,
			axis,
			marks,
			$$slots: { axis: true, marks: true }
		});
	}

	return $.pop($$exports);
}