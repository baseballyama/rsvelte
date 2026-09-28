import * as $ from 'svelte/internal/server';
import { LayerCake, Svg } from 'layercake';
import ScatterSvg from '../../_components/Scatter.svg.svelte';
import data from '../../_data/points.csv';

export default function Scatter_svg($$renderer) {
	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = 'myX';

	const yKey = 'myY';
	const r = 3;
	const padding = 10;
	const color = '#0cf';

	$$renderer.push(`<div class="chart-container svelte-1mmf0ky">`);

	LayerCake($$renderer, {
		padding: { top: 10 },
		x: xKey,
		y: yKey,
		xPadding: [padding, padding],
		yPadding: [padding, padding],
		data,
		children: ($$renderer) => {
			Svg($$renderer, {
				children: ($$renderer) => {
					ScatterSvg($$renderer, { r, fill: color });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}