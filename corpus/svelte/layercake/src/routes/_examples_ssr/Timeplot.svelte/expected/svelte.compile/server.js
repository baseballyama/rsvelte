import * as $ from 'svelte/internal/server';
import { LayerCake, Html, calcExtents } from 'layercake';
import { timeDay } from 'd3-time';
import { scaleBand, scaleTime } from 'd3-scale';
import AxisX from '../../_components/AxisX.percent-range.html.svelte';
import AxisY from '../../_components/AxisY.percent-range.html.svelte';
import Scatter from '../../_components/Scatter.html.svelte';
import data from '../../_data/days.csv';

export default function Timeplot($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
		const xKey = 'seconds';

		const yKey = 'day';
		const r = 4;
		const padding = 2;

		const daysTransformed = data.map((d) => {
			const parts = d.timestring.split('T');
			const time = parts[1].replace('Z', '').split(':').map((q) => +q);

			d[xKey] = time[0] * 60 * 60 + time[1] * 60 + time[2];
			d[yKey] = parts[0];

			return d;
		});

		/* --------------------------------------------
		 * Generate a range of days in between the min and max
		 * in case we are missing any in our data so we can show empty days for them
		 */
		const extents = calcExtents(daysTransformed, { x: (d) => d.timestring });

		// Convert to string even though it is one to make Typescript happy
		const minDate = extents.x[0].toString().split('T')[0].split('-').map((d) => +d);

		const maxDate = extents.x[1].toString().split('T')[0].split('-').map((d) => +d);
		const allDays = timeDay.range(new Date(Date.UTC(minDate[0], minDate[1] - 1, minDate[2])), new Date(Date.UTC(maxDate[0], maxDate[1] - 1, maxDate[2] + 1))).map((d) => d.toISOString().split('T')[0]).sort();

		$$renderer.push(`<div class="chart-container svelte-8o4tp6">`);

		LayerCake($$renderer, {
			ssr: true,
			percentRange: true,
			padding: { top: 0, right: 15, bottom: 20, left: 75 },
			x: xKey,
			y: yKey,
			xDomain: [0, 24 * 60 * 60],
			yDomain: allDays,
			xScale: scaleTime(),
			yScale: scaleBand().paddingInner(0.05).round(true),
			xPadding: [padding, padding],
			data: daysTransformed,
			children: ($$renderer) => {
				Html($$renderer, {
					children: ($$renderer) => {
						AxisX($$renderer, {
							ticks: [0, 4, 8, 12, 16, 20, 24].map((d) => d * 60 * 60),
							format: (d) => `${Math.floor(d / 60 / 60)}:00`
						});

						$$renderer.push(`<!----> `);
						AxisY($$renderer, {});
						$$renderer.push(`<!----> `);
						Scatter($$renderer, { r, fill: 'rgba(255, 204, 0, 0.75)', strokeWidth: 0 });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}