import * as $ from 'svelte/internal/server';
import LineChartBase from './LineChart.base.svelte';
import Chart from '../../Chart/Chart.svg.svelte';
import Spline from '../../Spline/Spline.svg.svelte';

export default function LineChart_svg($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	LineChartBase($$renderer, $.spread_props([{ Chart, Spline }, props]));
}