import * as $ from 'svelte/internal/server';
import ServerChart from './ServerChart.svelte';
import Area from '$lib/components/Area/Area.svelte';
import Spline from '$lib/components/Spline/Spline.svelte';

export default function TestLineChart($$renderer, $$props) {
	let { data, width, height, capture, onCapture } = $$props;

	ServerChart($$renderer, {
		capture,
		onCapture,
		width,
		height,
		data,
		x: 'date',
		y: 'value',
		yDomain: [0, null],
		padding: { top: 20, right: 20, bottom: 20, left: 20 },
		children: ($$renderer) => {
			Area($$renderer, { fill: 'rgba(59, 130, 246, 0.15)', stroke: 'none' });
			$$renderer.push(`<!----> `);
			Spline($$renderer, { stroke: 'rgb(59, 130, 246)', strokeWidth: 2 });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}