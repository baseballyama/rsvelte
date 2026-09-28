import * as $ from 'svelte/internal/server';
import { LayerCake, Svg, flatten } from 'layercake';
import { stack } from 'd3-shape';
import { scaleOrdinal } from 'd3-scale';
import { timeParse } from 'd3-time-format';
import AreaStacked from '../../_components/AreaStacked.svelte';
import data from '../../_data/fruit.csv';

export default function AreaStacked_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
		const xKey = 'month';

		const yKey = [0, 1];
		const zKey = 'key';
		const parseDate = timeParse('%Y-%m-%d');
		const seriesNames = Object.keys(data[0]).filter((d) => d !== xKey);
		const seriesColors = ['#ff00cc', '#ff7ac7', '#ffb3c0', '#ffe4b8'];

		data.forEach((d) => {
			d[xKey] = typeof d[xKey] === 'string' ? parseDate(d[xKey]) : d[xKey];
		});

		/* --------------------------------------------
		 * Create a stacked data structure
		 */
		const stackData = stack().keys(seriesNames);

		const series = stackData(data);

		$$renderer.push(`<div class="chart-container svelte-1ndt3wu">`);

		LayerCake($$renderer, {
			x: (d) => d.data[xKey],
			y: yKey,
			z: zKey,
			zScale: scaleOrdinal(),
			zDomain: seriesNames,
			zRange: seriesColors,
			flatData: flatten(series),
			data: series,
			children: ($$renderer) => {
				Svg($$renderer, {
					children: ($$renderer) => {
						AreaStacked($$renderer, {});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}