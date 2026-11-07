import * as $ from 'svelte/internal/server';
import AreaChartBase from './AreaChart.base.svelte';
import Chart from '../../Chart/Chart.svg.svelte';
import Area from '../../Area/Area.svg.svelte';

export default function AreaChart_svg($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	AreaChartBase($$renderer, $.spread_props([{ Chart, Area }, props]));
}