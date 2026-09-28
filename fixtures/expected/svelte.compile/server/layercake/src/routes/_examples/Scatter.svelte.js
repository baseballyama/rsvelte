import * as $ from 'svelte/internal/server';
import { LayerCake, Svg, Canvas } from 'layercake';
import ScatterSvg from '../../_components/Scatter.svg.svelte';
import ScatterCanvas from '../../_components/Scatter.canvas.svelte';
import Voronoi from '../../_components/Voronoi.svelte';
import AxisX from '../../_components/AxisX.svelte';
import AxisY from '../../_components/AxisY.svelte';
import data from '../../_data/points.csv';

export default function Scatter($$renderer) {
	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = 'myX';

	const yKey = 'myY';
	const r = 3;
	const padding = 10;
	const color = '#fff';

	function logEvent(d) {
		console.log('dispatched event', d, d.detail);
	}

	$$renderer.push(`<div class="chart-container svelte-1jw6oh1">`);

	LayerCake($$renderer, {
		padding: { top: 10, right: 5, bottom: 20, left: 25 },
		x: xKey,
		y: yKey,
		xPadding: [padding, padding],
		yPadding: [padding, padding],
		data,
		children: ($$renderer) => {
			Svg($$renderer, {
				children: ($$renderer) => {
					AxisX($$renderer, { gridlines: false });
					$$renderer.push(`<!----> `);
					AxisY($$renderer, { gridlines: false, ticks: 4 });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Canvas($$renderer, {
				children: ($$renderer) => {
					ScatterCanvas($$renderer, { r: r * 1.5, fill: '#0cf' });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Svg($$renderer, {
				children: ($$renderer) => {
					ScatterSvg($$renderer, { r, fill: color });
					$$renderer.push(`<!----> `);
					Voronoi($$renderer, { stroke: '#333', onmouseover: logEvent });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}