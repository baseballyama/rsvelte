import * as $ from 'svelte/internal/server';
import BarChartBase from './BarChart.base.svelte';
import Chart from '../../Chart/Chart.svg.svelte';
import Bars from '../../Bars/Bars.svg.svelte';

export default function BarChart_svg($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	BarChartBase($$renderer, $.spread_props([{ Chart, Bars }, props]));
}