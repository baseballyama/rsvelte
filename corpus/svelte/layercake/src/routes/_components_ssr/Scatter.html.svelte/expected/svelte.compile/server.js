import * as $ from 'svelte/internal/server';
import { LayerCake, Html } from 'layercake';
import Scatter from '../../_components/Scatter.html.svelte';
import data from '../../_data/points.csv';

export default function Scatter_html($$renderer) {
	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = 'myX';

	const yKey = 'myY';
	const r = 4.5;
	const padding = 2.5;
	const fill = '#fff';
	const stroke = '#0cf';
	const strokeWidth = 1.5;

	$$renderer.push(`<div class="chart-container svelte-ix6krs">`);

	LayerCake($$renderer, {
		ssr: true,
		percentRange: true,
		padding: { top: 10 },
		x: xKey,
		y: yKey,
		xPadding: [padding, padding],
		yPadding: [padding, padding],
		data,
		children: ($$renderer) => {
			Html($$renderer, {
				children: ($$renderer) => {
					Scatter($$renderer, { r, fill, stroke, strokeWidth });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}