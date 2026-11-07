import * as $ from 'svelte/internal/server';
import { LayerCake, Canvas } from 'layercake';
import ScatterCanvas from '../../_components/Scatter.canvas.svelte';
import data from '../../_data/points.csv';

export default function Scatter_canvas($$renderer) {
	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = 'myX';

	const yKey = 'myY';
	const r = 3;
	const padding = 10;

	$$renderer.push(`<div class="chart-container svelte-193n8yg">`);

	LayerCake($$renderer, {
		padding: { top: 10 },
		x: xKey,
		y: yKey,
		xPadding: [padding, padding],
		yPadding: [padding, padding],
		data,
		children: ($$renderer) => {
			Canvas($$renderer, {
				children: ($$renderer) => {
					ScatterCanvas($$renderer, { r, fill: '#0cf' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}