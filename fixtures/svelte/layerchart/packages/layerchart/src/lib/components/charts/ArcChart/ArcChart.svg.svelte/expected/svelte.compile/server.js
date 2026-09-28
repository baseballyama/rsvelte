import * as $ from 'svelte/internal/server';
import ArcChartBase from './ArcChart.base.svelte';
import Chart from '../../Chart/Chart.svg.svelte';
import Arc from '../../Arc/Arc.svg.svelte';
import ArcLabel from '../../ArcLabel/ArcLabel.svg.svelte';
import Group from '../../Group/Group.svg.svelte';

export default function ArcChart_svg($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	ArcChartBase($$renderer, $.spread_props([{ Chart, Arc, ArcLabel, Group }, props]));
}