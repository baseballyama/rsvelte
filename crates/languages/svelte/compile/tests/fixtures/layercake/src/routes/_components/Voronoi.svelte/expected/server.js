import * as $ from 'svelte/internal/server';
import { LayerCake, Svg } from 'layercake';
import Voronoi from '../../_components/Voronoi.svelte';
import data from '../../_data/points.csv';

export default function Voronoi_1($$renderer) {
	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = 'myX';

	const yKey = 'myY';

	/**
	 * @param {MouseEvent} e
	 * @param {Array<number>} point
	 */
	function logEvent(e, point) {
		console.log('dispatched event', point);
	}

	$$renderer.push(`<div class="chart-container svelte-9wfyfy">`);

	LayerCake($$renderer, {
		padding: { top: 10 },
		x: xKey,
		y: yKey,
		data,
		children: ($$renderer) => {
			Svg($$renderer, {
				children: ($$renderer) => {
					Voronoi($$renderer, { stroke: '#000', onmouseover: logEvent });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}