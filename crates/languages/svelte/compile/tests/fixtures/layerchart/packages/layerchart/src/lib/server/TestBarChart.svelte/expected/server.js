import * as $ from 'svelte/internal/server';
import { scaleBand } from 'd3-scale';
import ServerChart from './ServerChart.svelte';
import Bars from '$lib/components/Bars/Bars.svelte';

export default function TestBarChart($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, width, height, capture, onCapture } = $$props;

		ServerChart($$renderer, {
			capture,
			onCapture,
			width,
			height,
			data,
			x: 'category',
			xScale: scaleBand().paddingInner(0.2).paddingOuter(0.1),
			y: 'value',
			yDomain: [0, null],
			padding: { top: 20, right: 20, bottom: 30, left: 40 },
			children: ($$renderer) => {
				Bars($$renderer, { fill: 'rgb(59, 130, 246)', radius: 4 });
			},
			$$slots: { default: true }
		});
	});
}