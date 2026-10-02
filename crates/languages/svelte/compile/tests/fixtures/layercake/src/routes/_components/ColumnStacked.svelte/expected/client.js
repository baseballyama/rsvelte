import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Svg, flatten, uniques } from 'layercake';
import { stack } from 'd3-shape';
import { scaleBand, scaleOrdinal } from 'd3-scale';
import ColumnStacked from '../../_components/ColumnStacked.svelte';
import data from '../../_data/fruitOrdinal.csv';

var root = $.from_html(`<div class="chart-container svelte-1s941r7"><!></div>`);

export default function ColumnStacked_1($$anchor, $$props) {
	$.push($$props, true);

	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = 'year';

	const yKey = [0, 1];
	const zKey = 'key';
	const seriesNames = Object.keys(data[0]).filter((d) => d !== xKey);
	const seriesColors = ['#00e047', '#7ceb68', '#b7f486', '#ecfda5'];
	const stackData = stack().keys(seriesNames);
	const series = stackData(data);
	var div = root();
	var node = $.child(div);

	{
		let $0 = $.derived(() => scaleBand().paddingInner(0.02).round(true));
		let $1 = $.derived(() => uniques(data, xKey));
		let $2 = $.derived(scaleOrdinal);
		let $3 = $.derived(() => flatten(series));

		LayerCake(node, {
			padding: { top: 10 },
			x: (d) => d.data[xKey],
			get y() {
				return yKey;
			},
			z: zKey,
			get xScale() {
				return $.get($0);
			},

			get xDomain() {
				return $.get($1);
			},

			get zScale() {
				return $.get($2);
			},

			get zDomain() {
				return seriesNames;
			},

			get zRange() {
				return seriesColors;
			},

			get flatData() {
				return $.get($3);
			},

			get data() {
				return series;
			},

			children: ($$anchor, $$slotProps) => {
				Svg($$anchor, {
					children: ($$anchor, $$slotProps) => {
						ColumnStacked($$anchor, {});
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