import * as $ from 'svelte/internal/server';
import { Axis, Chart, Group, Spline, pivotLonger } from 'layerchart';
import { extent } from 'd3-array';
import { scaleLinear, scalePoint } from 'd3-scale';
import { getPenguins } from '$lib/data.remote';

const penguins = await getPenguins();

export default function Parallel_coordinates_faceted($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		{
			function axis($$renderer, { context }) {
				Axis($$renderer, {
					placement: 'top',
					format: (d) => dimensions[d],
					tickLength: 0
				});

				$$renderer.push(`<!----> <!--[-->`);

				const each_array = $.ensure_array_like(keys);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let key = each_array[$$index];

					Group($$renderer, {
						x: context.xScale(key),
						children: ($$renderer) => {
							Axis($$renderer, {
								placement: 'left',
								scale: scales.get(key)?.copy().range([context.height, 0]),
								ticks: 6,
								rule: true,
								facetAll: true
							});
						},
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!--]-->`);
			}

			function marks($$renderer) {
				Spline($$renderer, { stroke: 'species', strokeWidth: 1, opacity: 0.4 });
			}

			Chart($$renderer, {
				data,
				x: 'dimension',
				xScale: scalePoint(),
				xDomain: keys,
				y: (d) => scales.get(d.dimension)?.(d.value),
				yDomain: [0, 1],
				z: 'id',
				fy: 'species',
				series,
				padding: { left: 48, right: 76, top: 32, bottom: 8 },
				height: 560,
				axis,
				marks,
				$$slots: { axis: true, marks: true }
			});
		}

		$.bind_props($$props, { data });
	});
}