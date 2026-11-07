import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Svg, flatten } from 'layercake';
import { stack } from 'd3-shape';
import { scaleOrdinal } from 'd3-scale';
import { timeParse } from 'd3-time-format';
import AreaStacked from '../../_components/AreaStacked.svelte';
import data from '../../_data/fruit.csv';

var root = $.from_html(`<div class="chart-container svelte-1ndt3wu"><!></div>`);

export default function AreaStacked_1($$anchor, $$props) {
	$.push($$props, true);

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
	var div = root();
	var node = $.child(div);

	{
		let $0 = $.derived(scaleOrdinal);
		let $1 = $.derived(() => flatten(series));

		LayerCake(node, {
			x: (d) => d.data[xKey],
			get y() {
				return yKey;
			},
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

			get data() {
				return series;
			},

			children: ($$anchor, $$slotProps) => {
				Svg($$anchor, {
					children: ($$anchor, $$slotProps) => {
						AreaStacked($$anchor, {});
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