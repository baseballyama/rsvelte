import * as $ from 'svelte/internal/server';
import LineChartBase from './LineChart.base.svelte';
import Chart from '../../Chart/Chart.canvas.svelte';
import Spline from '../../Spline/Spline.canvas.svelte';

export default function LineChart_canvas($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	LineChartBase($$renderer, $.spread_props([{ Chart, Spline }, props]));
}