import * as $ from 'svelte/internal/server';
import { LayerCake, Html } from 'layercake';
import { scaleBand, scaleOrdinal } from 'd3-scale';
import ClevelandDotPlot from '../../_components/ClevelandDotPlot.percent-range.html.svelte';
import data from '../../_data/fruitOrdinal.csv';

export default function ClevelandDotPlot_html($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
		const yKey = 'year';

		const xKey = Object.keys(data[0]).filter((d) => d !== yKey);
		const seriesColors = ['#f0c', '#00bbff', '#00e047', '#ff7a33'];

		$$renderer.push(`<div class="chart-container svelte-simqwd">`);

		LayerCake($$renderer, {
			ssr: true,
			percentRange: true,
			padding: { left: 10, right: 10 },
			x: xKey,
			y: yKey,
			yScale: scaleBand().paddingInner(0.05).round(true),
			yDomain: [2016, 2017, 2018, 2019],
			zScale: scaleOrdinal(),
			zDomain: xKey,
			zRange: seriesColors,
			data,
			children: ($$renderer) => {
				Html($$renderer, {
					children: ($$renderer) => {
						ClevelandDotPlot($$renderer, {});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}