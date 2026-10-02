import * as $ from 'svelte/internal/server';
import { LayerCake, Svg, flatten, uniques } from 'layercake';
import { stack } from 'd3-shape';
import { scaleBand, scaleOrdinal } from 'd3-scale';
import ColumnStacked from '../../_components/ColumnStacked.svelte';
import data from '../../_data/fruitOrdinal.csv';

export default function ColumnStacked_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
		const xKey = 'year';

		const yKey = [0, 1];
		const zKey = 'key';
		const seriesNames = Object.keys(data[0]).filter((d) => d !== xKey);
		const seriesColors = ['#00e047', '#7ceb68', '#b7f486', '#ecfda5'];
		const stackData = stack().keys(seriesNames);
		const series = stackData(data);

		$$renderer.push(`<div class="chart-container svelte-1s941r7">`);

		LayerCake($$renderer, {
			padding: { top: 10 },
			x: (d) => d.data[xKey],
			y: yKey,
			z: zKey,
			xScale: scaleBand().paddingInner(0.02).round(true),
			xDomain: uniques(data, xKey),
			zScale: scaleOrdinal(),
			zDomain: seriesNames,
			zRange: seriesColors,
			flatData: flatten(series),
			data: series,
			children: ($$renderer) => {
				Svg($$renderer, {
					children: ($$renderer) => {
						ColumnStacked($$renderer, {});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}