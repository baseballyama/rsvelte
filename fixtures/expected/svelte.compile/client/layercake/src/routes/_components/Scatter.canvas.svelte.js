import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Canvas } from 'layercake';
import ScatterCanvas from '../../_components/Scatter.canvas.svelte';
import data from '../../_data/points.csv';

var root = $.from_html(`<div class="chart-container svelte-193n8yg"><!></div>`);

export default function Scatter_canvas($$anchor) {
	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = 'myX';

	const yKey = 'myY';
	const r = 3;
	const padding = 10;
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
			Canvas($$anchor, {
				children: ($$anchor, $$slotProps) => {
					ScatterCanvas($$anchor, { r, fill: '#0cf' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}