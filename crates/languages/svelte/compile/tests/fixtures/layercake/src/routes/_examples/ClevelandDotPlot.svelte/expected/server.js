import * as $ from 'svelte/internal/server';
import { LayerCake, Svg } from 'layercake';
import { scaleBand, scaleOrdinal } from 'd3-scale';
import ClevelandDotPlot from '../../_components/ClevelandDotPlot.svelte';
import AxisX from '../../_components/AxisX.svelte';
import AxisY from '../../_components/AxisY.svelte';
import data from '../../_data/fruitOrdinal.csv';

export default function ClevelandDotPlot_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
		const yKey = 'year';

		const xKey = Object.keys(data[0]).filter((d) => d !== yKey);
		const seriesColors = ['#f0c', '#00bbff', '#00e047', '#ff7a33'];

		$$renderer.push(`<div class="chart-container svelte-1t5cdoh">`);

		LayerCake($$renderer, {
			padding: { right: 10, bottom: 20, left: 30 },
			x: xKey,
			y: yKey,
			yScale: scaleBand().paddingInner(0.05).round(true),
			yDomainSort: true,
			xDomain: [0, null],
			xPadding: [10, 0],
			zScale: scaleOrdinal(),
			zDomain: xKey,
			zRange: seriesColors,
			data,
			children: ($$renderer) => {
				Svg($$renderer, {
					children: ($$renderer) => {
						AxisX($$renderer, {});
						$$renderer.push(`<!----> `);
						AxisY($$renderer, { gridlines: false });
						$$renderer.push(`<!----> `);
						ClevelandDotPlot($$renderer, {});
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