import * as $ from 'svelte/internal/server';
import { LayerCake, ScaledSvg, Html } from 'layercake';
import { scaleOrdinal } from 'd3-scale';
import { timeParse, timeFormat } from 'd3-time-format';
import MultiLine from '../../_components/MultiLine.svelte';
import SharedTooltip from '../../_components/SharedTooltip.percent-range.html.svelte';
import data from '../../_data/fruit.csv';

export default function SharedTooltip_percent_range_html($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
		/* --------------------------------------------
		 * Set what is our x key to separate it from the other series
		 */
		const xKey = 'month';

		const yKey = 'value';
		const zKey = 'key';
		const seriesNames = Object.keys(data[0]).filter((d) => d !== xKey);
		const seriesColors = ['#ffe4b8', '#ffb3c0', '#ff7ac7', '#ff00cc'];
		const parseDate = timeParse('%Y-%m-%d');

		const dataLong = seriesNames.map((key) => {
			return {
				key,
				values: data.map((d) => {
					// Put this in a conditional so that we don't recast the data on second render
					d[xKey] = typeof d[xKey] === 'string' ? parseDate(d[xKey]) : d[xKey];

					return { key, [yKey]: +d[key], [xKey]: d[xKey] };
				})
			};
		});

		// Make a flat array of the `values` of our nested series
		// we can pluck the `value` field from each item in the array to measure extents
		const flatten = (data) => data.reduce(
			(memo, group) => {
				return memo.concat(group.values);
			},
			[]
		);

		const formatLabelX = timeFormat('%b. %e');

		$$renderer.push(`<div class="chart-container svelte-m2y68p">`);

		LayerCake($$renderer, {
			ssr: true,
			percentRange: true,
			padding: // const formatLabelY = d => format(`~s`)(d);
			{ top: 20, right: 10 },
			x: xKey,
			y: yKey,
			z: zKey,
			zScale: scaleOrdinal(),
			zDomain: seriesNames,
			zRange: seriesColors,
			flatData: flatten(dataLong),
			yDomain: [0, null],
			data: dataLong,
			children: ($$renderer) => {
				ScaledSvg($$renderer, {
					children: ($$renderer) => {
						MultiLine($$renderer, {});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Html($$renderer, {
					children: ($$renderer) => {
						SharedTooltip($$renderer, { formatTitle: formatLabelX, dataset: data });
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