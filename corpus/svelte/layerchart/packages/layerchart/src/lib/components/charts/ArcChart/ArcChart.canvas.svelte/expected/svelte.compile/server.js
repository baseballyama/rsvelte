import * as $ from 'svelte/internal/server';
import ArcChartBase from './ArcChart.base.svelte';
import Chart from '../../Chart/Chart.canvas.svelte';
import Arc from '../../Arc/Arc.canvas.svelte';
import ArcLabel from '../../ArcLabel/ArcLabel.canvas.svelte';
import Group from '../../Group/Group.canvas.svelte';

export default function ArcChart_canvas($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	ArcChartBase($$renderer, $.spread_props([{ Chart, Arc, ArcLabel, Group }, props]));
}