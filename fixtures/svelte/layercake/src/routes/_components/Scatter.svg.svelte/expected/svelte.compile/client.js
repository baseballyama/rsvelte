import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Svg } from 'layercake';
import ScatterSvg from '../../_components/Scatter.svg.svelte';
import data from '../../_data/points.csv';

var root = $.from_html(`<div class="chart-container svelte-1mmf0ky"><!></div>`);

export default function Scatter_svg($$anchor) {
	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = 'myX';

	const yKey = 'myY';
	const r = 3;
	const padding = 10;
	const color = '#0cf';
	var div = root();
	var node = $.child(div);

	LayerCake(node, {
		padding: { top: 10 },
		x: xKey,
		y: yKey,
		xPadding: [padding, padding],
		yPadding: [padding, padding],
		get data() {
			return data;
		},

		children: ($$anchor, $$slotProps) => {
			Svg($$anchor, {
				children: ($$anchor, $$slotProps) => {
					ScatterSvg($$anchor, { r, fill: color });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}