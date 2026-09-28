import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Svg } from 'layercake';
import { scaleBand } from 'd3-scale';
import Bar from '../../_components/Bar.svelte';
import data from '../../_data/groups.csv';

var root = $.from_html(`<div class="chart-container svelte-ss85kl"><!></div>`);

export default function Bar_1($$anchor, $$props) {
	$.push($$props, true);

	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = 'value';

	const yKey = 'year';
	var div = root();
	var node = $.child(div);

	{
		let $0 = $.derived(() => scaleBand().paddingInner(0.05).round(true));

		LayerCake(node, {
			padding: { top: 10 },
			x: xKey,
			y: yKey,
			get yScale() {
				return $.get($0);
			},
			yDomain: [1979, 1980, 1981, 1982, 1983],
			xDomain: [0, null],
			get data() {
				return data;
			},

			children: ($$anchor, $$slotProps) => {
				Svg($$anchor, {
					children: ($$anchor, $$slotProps) => {
						Bar($$anchor, {});
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