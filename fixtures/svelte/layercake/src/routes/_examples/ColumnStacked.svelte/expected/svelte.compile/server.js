import * as $ from 'svelte/internal/server';
import { LayerCake, Svg, flatten, stack } from 'layercake';
import { scaleBand, scaleOrdinal } from 'd3-scale';
import { format } from 'd3-format';
import ColumnStacked from '../../_components/ColumnStacked.svelte';
import AxisX from '../../_components/AxisX.svelte';
import AxisY from '../../_components/AxisY.svelte';
import data from '../../_data/fruitOrdinal.csv';

export default function ColumnStacked_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
		const xKey = 'year';

		const yKey = [0, 1];
		const zKey = 'key';
		const seriesNames = Object.keys(data[0]).filter((d) => d !== xKey);
		const seriesColors = ['#00e047', '#7ceb68', '#b7f486', '#ecfda5'];
		const formatLabelY = (d) => format(`~s`)(d);
		const stackedData = stack(data, seriesNames);

		$$renderer.push(`<div class="chart-container svelte-1tyei20">`);

		LayerCake($$renderer, {
			padding: { top: 0, right: 0, bottom: 20, left: 20 },
			x: (d) => d.data[xKey],
			y: yKey,
			z: zKey,
			xScale: scaleBand().paddingInner(0.02).round(true),
			xDomainSort: false,
			zScale: scaleOrdinal(),
			zDomain: seriesNames,
			zRange: seriesColors,
			flatData: flatten(stackedData),
			data: stackedData,
			children: ($$renderer) => {
				Svg($$renderer, {
					children: ($$renderer) => {
						AxisX($$renderer, { gridlines: false });
						$$renderer.push(`<!----> `);
						AxisY($$renderer, { ticks: 4, gridlines: false, format: formatLabelY });
						$$renderer.push(`<!----> `);
						ColumnStacked($$renderer, {});
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