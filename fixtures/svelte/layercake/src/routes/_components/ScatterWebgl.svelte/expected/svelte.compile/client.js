import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, WebGL } from 'layercake';
import ScatterWebGL from '../../_components/Scatter.webgl.svelte';
import data from '../../_data/points.csv';

var root = $.from_html(`<div class="chart-container svelte-h760w5"><!></div>`);

export default function ScatterWebgl($$anchor) {
	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = 'myX';

	const yKey = 'myY';
	const r = 3;
	const padding = 6;
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
			WebGL($$anchor, {
				children: ($$anchor, $$slotProps) => {
					ScatterWebGL($$anchor, { r });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}