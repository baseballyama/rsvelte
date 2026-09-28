import 'svelte/internal/disclose-version';
import { getSfoTemperatures } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { AreaChart, Spline } from 'layerchart';
import { curveCatmullRom } from 'd3-shape';

const data = await getSfoTemperatures();

export default function Radial($$anchor, $$props) {
	$.push($$props, true);

	var $$exports = { data };

	{
		const belowMarks = ($$anchor) => {
			Spline($$anchor, {
				y: 'avg',
				get curve() {
					return curveCatmullRom;
				},
				class: 'stroke-primary'
			});
		};

		AreaChart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			y: ['minmin', 'maxmax'],
			yRange: ({ height }) => [height / 5, height / 2],
			radial: true,
			rule: { class: 'stroke-surface-content/20' },
			props: {
				area: { line: false, fillOpacity: 1 },
				xAxis: { format: 'month', tickMarks: false },
				yAxis: { ticks: 4, format: (v) => v + '° F' },
				highlight: { points: false },
				tooltip: { context: { mode: 'bisect-x' } }
			},
			series: [
				{
					key: 'min_max',
					label: 'min/max',
					value: ['min', 'max'],
					color: 'var(--color-primary)',
					props: { opacity: 0.2, line: { opacity: 0.2 } }
				},

				{
					key: 'minmin_maxmax',
					label: 'minmin/maxmax',
					value: ['minmin', 'maxmax'],
					color: 'var(--color-primary)',
					props: { opacity: 0.2, line: { opacity: 0.2 } }
				}
			],
			height: 500,
			belowMarks,
			$$slots: { belowMarks: true }
		});
	}

	return $.pop($$exports);
}