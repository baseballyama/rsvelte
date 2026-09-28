import * as $ from 'svelte/internal/server';
import { LayerCake, ScaledSvg, Html, flatten } from 'layercake';
import { stack } from 'd3-shape';
import { scaleBand, scaleOrdinal } from 'd3-scale';
import { format } from 'd3-format';
import BarStacked from '../../_components/BarStacked.svelte';
import AxisX from '../../_components/AxisX.percent-range.html.svelte';
import AxisY from '../../_components/AxisY.percent-range.html.svelte';
import data from '../../_data/fruitOrdinal.csv';

export default function BarStacked_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
		const xKey = 'year';

		const yKey = [0, 1];
		const zKey = 'key';
		const seriesNames = Object.keys(data[0]).filter((d) => d !== xKey);
		const seriesColors = ['#00bbff', '#8bcef6', '#c4e2ed', '#f7f6e3'];
		const stackData = stack().keys(seriesNames);
		const series = stackData(data);
		const formatLabelX = (d) => format(`~s`)(d);

		$$renderer.push(`<div class="chart-container svelte-12032dm">`);

		LayerCake($$renderer, {
			ssr: true,
			percentRange: true,
			padding: { top: 0, right: 0, bottom: 20, left: 35 },
			y: (d) => d.data[xKey],
			x: yKey,
			z: zKey,
			yScale: scaleBand().paddingInner(0.05).round(true),
			yDomainSort: true,
			zScale: scaleOrdinal(),
			zDomain: seriesNames,
			zRange: seriesColors,
			flatData: flatten(series),
			data: series,
			children: ($$renderer) => {
				Html($$renderer, {
					children: ($$renderer) => {
						AxisX($$renderer, { baseline: true, snapLabels: true, format: formatLabelX });
						$$renderer.push(`<!----> `);
						AxisY($$renderer, { gridlines: false });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				ScaledSvg($$renderer, {
					children: ($$renderer) => {
						BarStacked($$renderer, {});
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