import * as $ from 'svelte/internal/server';
import { LayerCake, Html } from 'layercake';
import Scatter from '../../_components/Scatter.html.svelte';
import AxisX from '../../_components/AxisX.percent-range.html.svelte';
import AxisY from '../../_components/AxisY.percent-range.html.svelte';
import data from '../../_data/points.csv';

export default function Scatter_1($$renderer) {
	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = 'myX';

	const yKey = 'myY';
	const r = 4.5;
	const padding = 2.5;
	const fill = '#fff';
	const stroke = '#0cf';
	const strokeWidth = 1.5;

	$$renderer.push(`<div class="chart-container svelte-1ua1ha">`);

	LayerCake($$renderer, {
		ssr: true,
		percentRange: true,
		padding: { top: 10, right: 5, bottom: 20, left: 25 },
		x: xKey,
		y: yKey,
		xPadding: [padding, padding],
		yPadding: [padding, padding],
		data,
		children: ($$renderer) => {
			Html($$renderer, {
				children: ($$renderer) => {
					AxisX($$renderer, {});
					$$renderer.push(`<!----> `);
					AxisY($$renderer, {});
					$$renderer.push(`<!----> `);
					Scatter($$renderer, { r, fill, stroke, strokeWidth });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}