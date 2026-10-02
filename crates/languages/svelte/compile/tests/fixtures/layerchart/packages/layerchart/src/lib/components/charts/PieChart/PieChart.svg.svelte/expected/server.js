import * as $ from 'svelte/internal/server';
import PieChartBase from './PieChart.base.svelte';
import Chart from '../../Chart/Chart.svg.svelte';
import Arc from '../../Arc/Arc.svg.svelte';
import ArcLabel from '../../ArcLabel/ArcLabel.svg.svelte';
import Group from '../../Group/Group.svg.svelte';
import Pie from '../../Pie/Pie.svg.svelte';

export default function PieChart_svg($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	PieChartBase($$renderer, $.spread_props([{ Chart, Arc, ArcLabel, Group, Pie }, props]));
}