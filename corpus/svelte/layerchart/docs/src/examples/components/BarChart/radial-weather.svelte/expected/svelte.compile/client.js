import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart, asAny, defaultChartPadding } from 'layerchart';
import { extent } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import { interpolate, quantize } from 'd3-interpolate';
import { interpolateSpectral } from 'd3-scale-chromatic';
import { timeMonth } from 'd3-time';

export default function Radial_weather($$anchor, $$props) {
	$.push($$props, true);

	// This would normally come from the load function in +page.ts
	// For this example, we'll create mock temperature data
	const data = Array.from({ length: 365 }, (_, i) => {
		const date = new Date(2000, 0, 1);

		date.setDate(i + 1);

		return {
			date,
			min: 40 + Math.random() * 20,
			max: 60 + Math.random() * 30,
			avg: 50 + Math.random() * 25
		};
	});

	const avgExtents = extent(data, (d) => d.avg);
	var $$exports = { data };

	{
		let $0 = $.derived(scaleLinear);
		let $1 = $.derived(() => quantize(interpolate(avgExtents[0], asAny(avgExtents[1])), 7));
		let $2 = $.derived(() => quantize(interpolateSpectral, 7).reverse());

		let $3 = $.derived(() => ({
			xAxis: { ticks: { interval: timeMonth.every(3) } },
			yAxis: { ticks: 4, format: (v) => v + '° F' },
			grid: { xTicks: 12 }
		}));

		let $4 = $.derived(() => defaultChartPadding({ top: 15, bottom: 15 }));

		BarChart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			y: ['min', 'max'],
			yDomain: [null, null],
			yRange: ({ height }) => [height / 5, height / 2],
			c: 'avg',
			get cScale() {
				return $.get($0);
			},

			get cDomain() {
				return $.get($1);
			},

			get cRange() {
				return $.get($2);
			},
			radial: true,
			get props() {
				return $.get($3);
			},

			get padding() {
				return $.get($4);
			},
			height: 600
		});
	}

	return $.pop($$exports);
}