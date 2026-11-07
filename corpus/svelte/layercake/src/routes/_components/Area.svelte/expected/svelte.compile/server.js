import * as $ from 'svelte/internal/server';
import { LayerCake, Svg } from 'layercake';
import Area from '../../_components/Area.svelte';
import data from '../../_data/points.csv';

export default function Area_1($$renderer) {
	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = 'myX';

	const yKey = 'myY';

	$$renderer.push(`<div class="chart-container svelte-1y30qzv">`);

	LayerCake($$renderer, {
		x: xKey,
		y: yKey,
		yDomain: [0, null],
		data,
		children: ($$renderer) => {
			Svg($$renderer, {
				children: ($$renderer) => {
					Area($$renderer, { fill: '#ff7ac7' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}