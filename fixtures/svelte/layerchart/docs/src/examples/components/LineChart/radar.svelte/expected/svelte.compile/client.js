import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LineChart } from 'layerchart';
import { curveLinearClosed } from 'd3-shape';

export default function Radar($$anchor, $$props) {
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
			xAxis: { tickLength: 0 },
			yAxis: { ticks: [0, 5, 10], format: (d) => '' },
			grid: { yTicks: [0, 5, 10], radialY: 'linear' },
			highlight: { lines: false },
			tooltip: { context: { mode: 'voronoi' } }
		}));

		LineChart($$anchor, {
			get data() {
				return data;
			},
			x: 'name',
			y: 'value',
			yPadding: [0, 8],
			padding: { top: 8 },
			radial: true,
			points: true,
			get props() {
				return $.get($0);
			},
			height: 300
		});
	}

	return $.pop($$exports);
}