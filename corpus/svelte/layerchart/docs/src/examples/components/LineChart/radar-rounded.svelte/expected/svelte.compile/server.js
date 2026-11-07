import * as $ from 'svelte/internal/server';
import { LineChart, defaultChartPadding } from 'layerchart';
import { curveLinearClosed } from 'd3-shape';

export default function Radar_rounded($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = [
			{ name: 'fastball', value: 10 },
			{ name: 'change', value: 0 },
			{ name: 'slider', value: 4 },
			{ name: 'cutter', value: 8 },
			{ name: 'curve', value: 5 }
		];

		LineChart($$renderer, {
			data,
			x: 'name',
			y: 'value',
			radial: true,
			points: true,
			props: {
				spline: {
					curve: curveLinearClosed,
					class: 'stroke-primary fill-primary/20'
				},
				xAxis: { tickLength: 10 },
				yAxis: { ticks: [0, 5, 10], format: (d) => '' },
				grid: { yTicks: [0, 5, 10] },
				highlight: { lines: false },
				tooltip: { context: { mode: 'voronoi' } }
			},
			padding: defaultChartPadding({ top: 20 }),
			height: 300
		});

		$.bind_props($$props, { data });
	});
}