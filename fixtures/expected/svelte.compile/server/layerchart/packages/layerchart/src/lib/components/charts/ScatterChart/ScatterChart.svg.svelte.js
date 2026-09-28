import * as $ from 'svelte/internal/server';
import ScatterChartBase from './ScatterChart.base.svelte';
import Chart from '../../Chart/Chart.svg.svelte';
import Points from '../../Points/Points.svg.svelte';

export default function ScatterChart_svg($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	ScatterChartBase($$renderer, $.spread_props([{ Chart, Points }, props]));
}