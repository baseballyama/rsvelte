import * as $ from 'svelte/internal/server';
import { LayerCake, ScaledSvg, Html, flatten } from 'layercake';
import { stack } from 'd3-shape';
import { scaleOrdinal } from 'd3-scale';
import { format } from 'd3-format';
import { timeParse, timeFormat } from 'd3-time-format';
import AxisX from '../../_components/AxisX.percent-range.html.svelte';
import AxisY from '../../_components/AxisY.percent-range.html.svelte';
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
		const formatLabelX = timeFormat('%b. %-d');
		const formatLabelY = (d) => format(`~s`)(d);

		$$renderer.push(`<div class="chart-container svelte-1eqhjxm">`);

		LayerCake($$renderer, {
			ssr: true,
			percentRange: true,
			padding: { top: 0, right: 0, bottom: 20, left: 17 },
			x: (d) => d.data[xKey],
			y: yKey,
			z: zKey,
			zScale: scaleOrdinal(),
			zDomain: seriesNames,
			zRange: seriesColors,
			flatData: flatten(series),
			data: series,
			children: ($$renderer) => {
				Html($$renderer, {
					children: ($$renderer) => {
						AxisX($$renderer, { format: formatLabelX, tickMarks: true });
						$$renderer.push(`<!----> `);
						AxisY($$renderer, { format: formatLabelY });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				ScaledSvg($$renderer, {
					children: ($$renderer) => {
						AreaStacked($$renderer, {});
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