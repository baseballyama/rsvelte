import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, ScaledSvg, Html } from 'layercake';
import { scaleOrdinal } from 'd3-scale';
import { timeParse, timeFormat } from 'd3-time-format';
import MultiLine from '../../_components/MultiLine.svelte';
import SharedTooltip from '../../_components/SharedTooltip.percent-range.html.svelte';
import data from '../../_data/fruit.csv';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="chart-container svelte-m2y68p"><!></div>`);

export default function SharedTooltip_percent_range_html($$anchor, $$props) {
	$.push($$props, true);

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

	var // const formatLabelY = d => format(`~s`)(d);
	div = root_1();

	var node = $.child(div);

	{
		let $0 = $.derived(scaleOrdinal);
		let $1 = $.derived(() => flatten(dataLong));

		LayerCake(node, {
			ssr: true,
			percentRange: true,
			padding: { top: 20, right: 10 },
			x: xKey,
			y: yKey,
			z: zKey,
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
			yDomain: [0, null],
			get data() {
				return dataLong;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				ScaledSvg(node_1, {
					children: ($$anchor, $$slotProps) => {
						MultiLine($$anchor, {});
					},
					$$slots: { default: true }
				});

				var node_2 = $.sibling(node_1, 2);

				Html(node_2, {
					children: ($$anchor, $$slotProps) => {
						SharedTooltip($$anchor, {
							get formatTitle() {
								return formatLabelX;
							},

							get dataset() {
								return data;
							}
						});
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}