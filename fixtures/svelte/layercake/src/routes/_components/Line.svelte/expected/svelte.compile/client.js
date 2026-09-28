import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Svg } from 'layercake';
import Line from '../../_components/Line.svelte';
import data from '../../_data/points.csv';

var root = $.from_html(`<div class="chart-container svelte-1rwyldu"><!></div>`);

export default function Line_1($$anchor) {
	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = 'myX';

	const yKey = 'myY';
	var div = root();
	var node = $.child(div);

	LayerCake(node, {
		padding: { top: 10 },
		x: xKey,
		y: yKey,
		get data() {
			return data;
		},

		children: ($$anchor, $$slotProps) => {
			Svg($$anchor, {
				children: ($$anchor, $$slotProps) => {
					Line($$anchor, { stroke: '#de63fd' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}