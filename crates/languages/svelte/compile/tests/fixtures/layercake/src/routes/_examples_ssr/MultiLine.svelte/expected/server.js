import * as $ from 'svelte/internal/server';
import { LayerCake, ScaledSvg, Html, flatten } from 'layercake';
import { scaleOrdinal } from 'd3-scale';
import { timeParse, timeFormat } from 'd3-time-format';
import { format } from 'd3-format';
import MultiLine from '../../_components/MultiLine.svelte';
import AxisX from '../../_components/AxisX.percent-range.html.svelte';
import AxisY from '../../_components/AxisY.percent-range.html.svelte';
import GroupLabels from '../../_components/GroupLabels.html.svelte';
import SharedTooltip from '../../_components/SharedTooltip.percent-range.html.svelte';
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
		const seriesNames = Object.keys(data[0]).filter((d) => d !== xKey);
		const seriesColors = ['#ffe4b8', '#ffb3c0', '#ff7ac7', '#ff00cc'];
		const parseDate = timeParse('%Y-%m-%d');

		/* --------------------------------------------
		 * Create a "long" format that is a grouped series of data points
		 * Layer Cake uses this data structure and the key names
		 * set in xKey, yKey and zKey to map your data into each scale.
		 */
		const dataLong = seriesNames.map((key) => {
			return {
				[zKey]: key,
				values: data.map((d) => {
					// Put this in a conditional so that we don't recast the data on second render
					d[xKey] = typeof d[xKey] === 'string' ? parseDate(d[xKey]) : d[xKey];

					return { [yKey]: +d[key], [xKey]: d[xKey], [zKey]: key };
				})
			};
		});

		const formatLabelX = timeFormat('%b. %e');
		const formatLabelY = (d) => format(`~s`)(d);

		$$renderer.push(`<div class="chart-container svelte-10xuix7">`);

		LayerCake($$renderer, {
			ssr: true,
			percentRange: true,
			padding: { top: 7, right: 10, bottom: 20, left: 25 },
			x: xKey,
			y: yKey,
			z: zKey,
			zScale: scaleOrdinal(),
			zRange: seriesColors,
			flatData: flatten(dataLong, 'values'),
			yDomain: [0, null],
			data: dataLong,
			children: ($$renderer) => {
				Html($$renderer, {
					children: ($$renderer) => {
						AxisX($$renderer, {
							gridlines: false,
							ticks: data.map((d) => d[xKey]).sort((a, b) => a - b),
							format: formatLabelX,
							snapLabels: true,
							tickMarks: true
						});

						$$renderer.push(`<!----> `);
						AxisY($$renderer, { format: formatLabelY });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				ScaledSvg($$renderer, {
					children: ($$renderer) => {
						MultiLine($$renderer, {});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Html($$renderer, {
					children: ($$renderer) => {
						GroupLabels($$renderer, {});
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