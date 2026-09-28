import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Svg } from 'layercake';
import { scaleOrdinal } from 'd3-scale';
import { timeParse } from 'd3-time-format';
import MultiLine from '../../_components/MultiLine.svelte';
import data from '../../_data/fruit.csv';

var root = $.from_html(`<div class="chart-container svelte-1gghcjz"><!></div>`);

export default function MultiLine_1($$anchor, $$props) {
	$.push($$props, true);

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

	const dataLong = seriesNames.map((key) => {
		return {
			[zKey]: key,
			values: data.map((d) => {
				// Put this in a conditional so that we don't recast the data on second render
				d[xKey] = typeof d[xKey] === 'string' ? parseDate(d[xKey]) : d[xKey];

				return { [yKey]: +d[key], [xKey]: d[xKey] };
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

	var div = root();
	var node = $.child(div);

	{
		let $0 = $.derived(scaleOrdinal);
		let $1 = $.derived(() => flatten(dataLong));

		LayerCake(node, {
			padding: { top: 10 },
			x: xKey,
			y: yKey,
			z: zKey,
			yDomain: [0, null],
			get zScale() {
				return $.get($0);
			},

			get zDomain() {
				return seriesNames;
			},

			get zRange() {
				return seriesColors;
			},

			get flatData() {
				return $.get($1);
			},

			get data() {
				return dataLong;
			},

			children: ($$anchor, $$slotProps) => {
				Svg($$anchor, {
					children: ($$anchor, $$slotProps) => {
						MultiLine($$anchor, {});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}