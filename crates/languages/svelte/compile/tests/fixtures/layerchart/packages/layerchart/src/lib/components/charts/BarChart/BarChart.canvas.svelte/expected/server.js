import * as $ from 'svelte/internal/server';
import BarChartBase from './BarChart.base.svelte';
import Chart from '../../Chart/Chart.canvas.svelte';
import Bars from '../../Bars/Bars.canvas.svelte';

export default function BarChart_canvas($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	BarChartBase($$renderer, $.spread_props([{ Chart, Bars }, props]));
}