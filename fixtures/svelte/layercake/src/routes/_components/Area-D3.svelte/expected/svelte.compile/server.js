import * as $ from 'svelte/internal/server';
import { LayerCake, Svg } from 'layercake';
import { curveCardinal } from 'd3-shape';
import Area from '../../_components/Area-D3.svelte';
import data from '../../_data/points.csv';

export default function Area_D3($$renderer) {
	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = 'myX';

	const yKey = 'myY';

	$$renderer.push(`<div class="chart-container svelte-1f9eob1">`);

	LayerCake($$renderer, {
		x: xKey,
		y: yKey,
		yDomain: [0, null],
		data,
		children: ($$renderer) => {
			Svg($$renderer, {
				children: ($$renderer) => {
					Area($$renderer, { fill: '#f0c', curve: curveCardinal });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}