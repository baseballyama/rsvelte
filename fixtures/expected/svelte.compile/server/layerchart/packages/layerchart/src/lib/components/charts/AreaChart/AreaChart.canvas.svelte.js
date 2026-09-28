import * as $ from 'svelte/internal/server';
import AreaChartBase from './AreaChart.base.svelte';
import Chart from '../../Chart/Chart.canvas.svelte';
import Area from '../../Area/Area.canvas.svelte';

export default function AreaChart_canvas($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	AreaChartBase($$renderer, $.spread_props([{ Chart, Area }, props]));
}