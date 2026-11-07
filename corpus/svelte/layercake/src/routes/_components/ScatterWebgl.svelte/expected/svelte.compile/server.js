import * as $ from 'svelte/internal/server';
import { LayerCake, WebGL } from 'layercake';
import ScatterWebGL from '../../_components/Scatter.webgl.svelte';
import data from '../../_data/points.csv';

export default function ScatterWebgl($$renderer) {
	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = 'myX';

	const yKey = 'myY';
	const r = 3;
	const padding = 6;

	$$renderer.push(`<div class="chart-container svelte-h760w5">`);

	LayerCake($$renderer, {
		padding: { top: 10 },
		x: xKey,
		y: yKey,
		xPadding: [padding, padding],
		yPadding: [padding, padding],
		data,
		children: ($$renderer) => {
			WebGL($$renderer, {
				children: ($$renderer) => {
					ScatterWebGL($$renderer, { r });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}