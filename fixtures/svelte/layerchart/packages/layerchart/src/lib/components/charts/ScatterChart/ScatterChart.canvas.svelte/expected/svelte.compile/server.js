import * as $ from 'svelte/internal/server';
import ScatterChartBase from './ScatterChart.base.svelte';
import Chart from '../../Chart/Chart.canvas.svelte';
import Points from '../../Points/Points.canvas.svelte';

export default function ScatterChart_canvas($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	ScatterChartBase($$renderer, $.spread_props([{ Chart, Points }, props]));
}