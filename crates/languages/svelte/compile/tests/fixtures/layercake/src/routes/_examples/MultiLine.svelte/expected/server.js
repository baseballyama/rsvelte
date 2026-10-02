import * as $ from 'svelte/internal/server';
import { LayerCake, Svg, Html, groupLonger, flatten } from 'layercake';
import { scaleOrdinal } from 'd3-scale';
import { timeParse, timeFormat } from 'd3-time-format';
import { format } from 'd3-format';
import MultiLine from '../../_components/MultiLine.svelte';
import AxisX from '../../_components/AxisX.svelte';
import AxisY from '../../_components/AxisY.svelte';
import Labels from '../../_components/GroupLabels.html.svelte';
import SharedTooltip from '../../_components/SharedTooltip.html.svelte';
import data from '../../_data/fruit.csv';

export default function MultiLine_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
		/* --------------------------------------------
		 * Set what is our x key to separate it from the other series
		 */
		const xKey = 'month';

		const yKey = 'value';
		const zKey = 'fruit';
		const xKeyCast = timeParse('%Y-%m-%d');
		const seriesNames = Object.keys(data[0]).filter((d) => d !== xKey);
		const seriesColors = ['#ffe4b8', '#ffb3c0', '#ff7ac7', '#ff00cc'];

		/* --------------------------------------------
		 * Cast values
		 */
		data.forEach((d) => {
			d[xKey] = typeof d[xKey] === 'string' ? xKeyCast(d[xKey]) : d[xKey];
		});

		const formatLabelX = timeFormat('%b. %e');
		const formatLabelY = (d) => format(`~s`)(d);
		const groupedData = groupLonger(data, seriesNames, { groupTo: zKey, valueTo: yKey });

		$$renderer.push(`<div class="chart-container svelte-1qgrk18">`);

		LayerCake($$renderer, {
			padding: { top: 7, right: 10, bottom: 20, left: 25 },
			x: xKey,
			y: yKey,
			z: zKey,
			yDomain: [0, null],
			zScale: scaleOrdinal(),
			zRange: seriesColors,
			flatData: flatten(groupedData, 'values'),
			data: groupedData,
			children: ($$renderer) => {
				Svg($$renderer, {
					children: ($$renderer) => {
						AxisX($$renderer, {
							gridlines: false,
							ticks: data.map((d) => d[xKey]).sort((a, b) => a - b),
							format: formatLabelX,
							snapLabels: true,
							tickMarks: true
						});

						$$renderer.push(`<!----> `);
						AxisY($$renderer, { ticks: 4, format: formatLabelY });
						$$renderer.push(`<!----> `);
						MultiLine($$renderer, {});
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Html($$renderer, {
					children: ($$renderer) => {
						Labels($$renderer, {});
						$$renderer.push(`<!----> `);
						SharedTooltip($$renderer, { formatTitle: formatLabelX, dataset: data });
						$$renderer.push(`<!---->`);
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