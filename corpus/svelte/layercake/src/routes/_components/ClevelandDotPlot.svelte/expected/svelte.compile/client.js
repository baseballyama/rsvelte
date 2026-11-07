import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Svg } from 'layercake';
import { scaleBand, scaleOrdinal } from 'd3-scale';
import ClevelandDotPlot from '../../_components/ClevelandDotPlot.svelte';
import data from '../../_data/fruitOrdinal.csv';

var root = $.from_html(`<div class="chart-container svelte-15k2sc6"><!></div>`);

export default function ClevelandDotPlot_1($$anchor, $$props) {
	$.push($$props, true);

	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const yKey = 'year';

	const xKey = Object.keys(data[0]).filter((d) => d !== yKey);
	const seriesColors = ['#f0c', '#00bbff', '#00e047', '#ff7a33'];
	var div = root();
	var node = $.child(div);

	{
		let $0 = $.derived(() => scaleBand().paddingInner(0.05).round(true));
		let $1 = $.derived(scaleOrdinal);

		LayerCake(node, {
			padding: { left: 10, right: 10 },
			get x() {
				return xKey;
			},
			y: yKey,
			get yScale() {
				return $.get($0);
			},
			yDomain: [2016, 2017, 2018, 2019],
			get zScale() {
				return $.get($1);
			},

			get zDomain() {
				return xKey;
			},

			get zRange() {
				return seriesColors;
			},

			get data() {
				return data;
			},

			children: ($$anchor, $$slotProps) => {
				Svg($$anchor, {
					children: ($$anchor, $$slotProps) => {
						ClevelandDotPlot($$anchor, {});
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