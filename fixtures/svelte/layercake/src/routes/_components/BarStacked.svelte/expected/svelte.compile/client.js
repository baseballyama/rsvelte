import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Svg, flatten } from 'layercake';
import { stack } from 'd3-shape';
import { scaleBand, scaleOrdinal } from 'd3-scale';
import BarStacked from '../../_components/BarStacked.svelte';
import data from '../../_data/fruitOrdinal.csv';

var root = $.from_html(`<div class="chart-container svelte-id6c1a"><!></div>`);

export default function BarStacked_1($$anchor, $$props) {
	$.push($$props, true);

	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = [0, 1];

	const yKey = 'year';
	const zKey = 'key';
	const seriesNames = Object.keys(data[0]).filter((d) => d !== yKey);
	const seriesColors = ['#00bbff', '#8bcef6', '#c4e2ed', '#f7f6e3'];
	const stackData = stack().keys(seriesNames);
	const series = stackData(data);
	var div = root();
	var node = $.child(div);

	{
		let $0 = $.derived(() => scaleBand().paddingInner(0.05).round(true));
		let $1 = $.derived(scaleOrdinal);
		let $2 = $.derived(() => flatten(series));

		LayerCake(node, {
			padding: { top: 10 },
			get x() {
				return xKey;
			},
			y: (d) => d.data[yKey],
			z: zKey,
			get yScale() {
				return $.get($0);
			},
			yDomain: [2016, 2017, 2018, 2019],
			get zScale() {
				return $.get($1);
			},

			get zDomain() {
				return seriesNames;
			},

			get zRange() {
				return seriesColors;
			},

			get flatData() {
				return $.get($2);
			},

			get data() {
				return series;
			},

			children: ($$anchor, $$slotProps) => {
				Svg($$anchor, {
					children: ($$anchor, $$slotProps) => {
						BarStacked($$anchor, {});
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