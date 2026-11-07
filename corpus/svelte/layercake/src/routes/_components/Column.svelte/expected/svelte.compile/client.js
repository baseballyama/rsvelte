import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Svg } from 'layercake';
import { scaleBand } from 'd3-scale';
import Column from '../../_components/Column.svelte';
import data from '../../_data/groups.csv';

var root = $.from_html(`<div class="chart-container svelte-11ye0du"><!></div>`);

export default function Column_1($$anchor, $$props) {
	$.push($$props, true);

	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = 'year';

	const yKey = 'value';
	var div = root();
	var node = $.child(div);

	{
		let $0 = $.derived(() => scaleBand().paddingInner(0.02).round(true));

		LayerCake(node, {
			padding: { top: 10 },
			x: xKey,
			y: yKey,
			get xScale() {
				return $.get($0);
			},
			xDomain: [1979, 1980, 1981, 1982, 1983],
			yDomain: [0, null],
			get data() {
				return data;
			},

			children: ($$anchor, $$slotProps) => {
				Svg($$anchor, {
					children: ($$anchor, $$slotProps) => {
						Column($$anchor, {});
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