import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LineChart, defaultChartPadding } from 'layerchart';
import { curveLinearClosed } from 'd3-shape';

export default function Radar_rounded($$anchor, $$props) {
	$.push($$props, true);

	const data = [
		{ name: 'fastball', value: 10 },
		{ name: 'change', value: 0 },
		{ name: 'slider', value: 4 },
		{ name: 'cutter', value: 8 },
		{ name: 'curve', value: 5 }
	];

	var $$exports = { data };

	{
		let $0 = $.derived(() => ({
			spline: {
				curve: curveLinearClosed,
				class: 'stroke-primary fill-primary/20'
			},
			xAxis: { tickLength: 10 },
			yAxis: { ticks: [0, 5, 10], format: (d) => '' },
			grid: { yTicks: [0, 5, 10] },
			highlight: { lines: false },
			tooltip: { context: { mode: 'voronoi' } }
		}));

		let $1 = $.derived(() => defaultChartPadding({ top: 20 }));

		LineChart($$anchor, {
			get data() {
				return data;
			},
			x: 'name',
			y: 'value',
			radial: true,
			points: true,
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