import * as $ from 'svelte/internal/server';
import { LayerCake, Svg, flatten, stack } from 'layercake';
import { scaleBand, scaleOrdinal } from 'd3-scale';
import { format } from 'd3-format';
import BarStacked from '../../_components/BarStacked.svelte';
import AxisX from '../../_components/AxisX.svelte';
import AxisY from '../../_components/AxisY.svelte';
import data from '../../_data/fruitOrdinal.csv';

export default function BarStacked_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
		const xKey = [0, 1];

		const yKey = 'year';
		const zKey = 'key';
		const seriesNames = Object.keys(data[0]).filter((d) => d !== yKey);
		const seriesColors = ['#00bbff', '#8bcef6', '#c4e2ed', '#f7f6e3'];
		const formatLabelX = (d) => format(`~s`)(d);
		const stackedData = stack(data, seriesNames);

		$$renderer.push(`<div class="chart-container svelte-qzc0e1">`);

		LayerCake($$renderer, {
			padding: { top: 0, bottom: 20, left: 35 },
			x: xKey,
			y: (d) => d.data[yKey],
			z: zKey,
			yScale: scaleBand().paddingInner(0.05),
			zScale: scaleOrdinal(),
			yDomainSort: true,
			zDomain: seriesNames,
			zRange: seriesColors,
			flatData: flatten(stackedData),
			data: stackedData,
			children: ($$renderer) => {
				Svg($$renderer, {
					children: ($$renderer) => {
						AxisX($$renderer, { baseline: true, snapLabels: true, format: formatLabelX });
						$$renderer.push(`<!----> `);
						AxisY($$renderer, { gridlines: false });
						$$renderer.push(`<!----> `);
						BarStacked($$renderer, {});
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