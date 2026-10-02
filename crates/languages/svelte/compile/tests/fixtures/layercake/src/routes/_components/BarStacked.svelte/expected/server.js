import * as $ from 'svelte/internal/server';
import { LayerCake, Svg, flatten } from 'layercake';
import { stack } from 'd3-shape';
import { scaleBand, scaleOrdinal } from 'd3-scale';
import BarStacked from '../../_components/BarStacked.svelte';
import data from '../../_data/fruitOrdinal.csv';

export default function BarStacked_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
		const xKey = [0, 1];

		const yKey = 'year';
		const zKey = 'key';
		const seriesNames = Object.keys(data[0]).filter((d) => d !== yKey);
		const seriesColors = ['#00bbff', '#8bcef6', '#c4e2ed', '#f7f6e3'];
		const stackData = stack().keys(seriesNames);
		const series = stackData(data);

		$$renderer.push(`<div class="chart-container svelte-id6c1a">`);

		LayerCake($$renderer, {
			padding: { top: 10 },
			x: xKey,
			y: (d) => d.data[yKey],
			z: zKey,
			yScale: scaleBand().paddingInner(0.05).round(true),
			yDomain: [2016, 2017, 2018, 2019],
			zScale: scaleOrdinal(),
			zDomain: seriesNames,
			zRange: seriesColors,
			flatData: flatten(series),
			data: series,
			children: ($$renderer) => {
				Svg($$renderer, {
					children: ($$renderer) => {
						BarStacked($$renderer, {});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}