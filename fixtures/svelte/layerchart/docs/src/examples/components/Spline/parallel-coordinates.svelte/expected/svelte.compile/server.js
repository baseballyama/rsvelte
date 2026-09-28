import * as $ from 'svelte/internal/server';
import { Axis, Chart, Group, Legend, Spline, Text, pivotLonger } from 'layerchart';
import { extent } from 'd3-array';
import { scaleLinear, scalePoint } from 'd3-scale';
import { getPenguins } from '$lib/data.remote';

const penguins = await getPenguins();

export default function Parallel_coordinates($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		{
			function legend($$renderer) {
				Legend($$renderer, {
					variant: 'swatches',
					placement: 'top-left',
					orientation: 'horizontal'
				});
			}

			function axis($$renderer, { context }) {
				$$renderer.push(`<!--[-->`);

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
								rule: true
							});

							$$renderer.push(`<!----> `);

							Text($$renderer, {
								value: dimensions[key],
								y: -12,
								textAnchor: 'middle',
								class: 'text-xs font-medium fill-surface-content'
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!--]-->`);
			}

			function marks($$renderer, { context }) {
				Spline($$renderer, {
					data: data.filter((d) => context.series.isVisible(d.species)),
					stroke: 'species',
					strokeWidth: 1,
					opacity: (d) => context.series.isHighlighted(d.species, true) ? 0.4 : 0.05
				});
			}

			Chart($$renderer, {
				data,
				x: 'dimension',
				xScale: scalePoint(),
				xDomain: keys,
				y: (d) => scales.get(d.dimension)?.(d.value),
				yDomain: [0, 1],
				z: 'id',
				series,
				padding: { left: 48, right: 48, top: 48, bottom: 8 },
				height: 400,
				legend,
				axis,
				marks,
				$$slots: { legend: true, axis: true, marks: true }
			});
		}

		$.bind_props($$props, { data });
	});
}