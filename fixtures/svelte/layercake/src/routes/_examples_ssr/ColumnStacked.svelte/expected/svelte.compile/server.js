import * as $ from 'svelte/internal/server';
import { LayerCake, ScaledSvg, Html, flatten } from 'layercake';
import { stack } from 'd3-shape';
import { scaleBand, scaleOrdinal } from 'd3-scale';
import { format } from 'd3-format';
import ColumnStacked from '../../_components/ColumnStacked.svelte';
import AxisX from '../../_components/AxisX.percent-range.html.svelte';
import AxisY from '../../_components/AxisY.percent-range.html.svelte';
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
		const formatLabelY = (d) => format(`~s`)(d);

		$$renderer.push(`<div class="chart-container svelte-16qmzvz">`);

		LayerCake($$renderer, {
			ssr: true,
			percentRange: true,
			padding: { top: 0, right: 0, bottom: 20, left: 20 },
			x: (d) => d.data[xKey],
			y: yKey,
			z: zKey,
			xScale: scaleBand().paddingInner(0.028).round(true),
			xDomainSort: false,
			zScale: scaleOrdinal(),
			zDomain: seriesNames,
			zRange: seriesColors,
			flatData: flatten(series),
			data: series,
			children: ($$renderer) => {
				Html($$renderer, {
					children: ($$renderer) => {
						AxisX($$renderer, { gridlines: false });
						$$renderer.push(`<!----> `);
						AxisY($$renderer, { ticks: 4, gridlines: false, format: formatLabelY });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				ScaledSvg($$renderer, {
					children: ($$renderer) => {
						ColumnStacked($$renderer, {});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}