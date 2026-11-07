import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LineChart, defaultChartPadding } from 'layerchart';
import { curveLinearClosed } from 'd3-shape';

export default function Radar_series($$anchor, $$props) {
	$.push($$props, true);

	const data = [
		{ name: 'Sales', budget: 22000, actual: 40000 },
		{ name: 'Administration', budget: 3000, actual: 14000 },
		{ name: 'Information Technology', budget: 20000, actual: 28000 },
		{ name: 'Customer Support', budget: 35000, actual: 26000 },
		{ name: 'Development', budget: 50000, actual: 42000 },
		{ name: 'Marketing', budget: 18000, actual: 21000 }
	];

	var $$exports = { data };

	{
		let $0 = $.derived(() => ({
			spline: { curve: curveLinearClosed },
			xAxis: { tickLength: 0 },
			yAxis: { ticks: 4, format: 'metric' },
			grid: { radialY: 'linear' },
			highlight: { lines: false },
			tooltip: { context: { mode: 'voronoi' } }
		}));

		let $1 = $.derived(() => defaultChartPadding({ top: 10 }));

		LineChart($$anchor, {
			get data() {
				return data;
			},
			x: 'name',
			yPadding: [0, 8],
			radial: true,
			series: [
				{
					key: 'budget',
					color: 'var(--color-secondary)',
					props: { class: 'fill-secondary/50' }
				},

				{
					key: 'actual',
					color: 'var(--color-primary)',
					props: { class: 'fill-primary/50' }
				}
			],

			get props() {
				return $.get($0);
			},

			get padding() {
				return $.get($1);
			},
			height: 300
		});
	}

	return $.pop($$exports);
}