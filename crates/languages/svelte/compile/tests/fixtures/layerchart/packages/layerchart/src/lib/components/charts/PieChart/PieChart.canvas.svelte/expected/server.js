import * as $ from 'svelte/internal/server';
import PieChartBase from './PieChart.base.svelte';
import Chart from '../../Chart/Chart.canvas.svelte';
import Arc from '../../Arc/Arc.canvas.svelte';
import ArcLabel from '../../ArcLabel/ArcLabel.canvas.svelte';
import Group from '../../Group/Group.canvas.svelte';
import Pie from '../../Pie/Pie.canvas.svelte';

export default function PieChart_canvas($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	PieChartBase($$renderer, $.spread_props([{ Chart, Arc, ArcLabel, Group, Pie }, props]));
}