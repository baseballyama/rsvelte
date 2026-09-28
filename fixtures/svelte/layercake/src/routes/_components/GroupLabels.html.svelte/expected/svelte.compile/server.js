import * as $ from 'svelte/internal/server';
import { LayerCake, Svg, Html } from 'layercake';
import { scaleOrdinal } from 'd3-scale';
import { timeParse } from 'd3-time-format';
import MultiLine from '../../_components/MultiLine.svelte';
import Labels from '../../_components/GroupLabels.html.svelte';
import data from '../../_data/fruit.csv';

export default function GroupLabels_html($$renderer, $$props) {
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

		$$renderer.push(`<div class="chart-container svelte-1ft6pzt">`);

		LayerCake($$renderer, {
			padding: { top: 7, right: 10 },
			x: xKey,
			y: yKey,
			z: zKey,
			yDomain: [0, null],
			zScale: scaleOrdinal(),
			zDomain: seriesNames,
			zRange: seriesColors,
			flatData: flatten(dataLong),
			data: dataLong,
			children: ($$renderer) => {
				Svg($$renderer, {
					children: ($$renderer) => {
						MultiLine($$renderer, {});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Html($$renderer, {
					children: ($$renderer) => {
						Labels($$renderer, {});
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