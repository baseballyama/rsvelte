import * as $ from 'svelte/internal/server';
import { LayerCake, Svg } from 'layercake';
import Line from '../../_components/Line.svelte';
import data from '../../_data/points.csv';

export default function Line_1($$renderer) {
	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = 'myX';

	const yKey = 'myY';

	$$renderer.push(`<div class="chart-container svelte-1rwyldu">`);

	LayerCake($$renderer, {
		padding: { top: 10 },
		x: xKey,
		y: yKey,
		data,
		children: ($$renderer) => {
			Svg($$renderer, {
				children: ($$renderer) => {
					Line($$renderer, { stroke: '#de63fd' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}