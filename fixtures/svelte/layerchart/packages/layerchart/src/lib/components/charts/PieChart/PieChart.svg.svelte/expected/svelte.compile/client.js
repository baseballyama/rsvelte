import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import PieChartBase from './PieChart.base.svelte';
import Chart from '../../Chart/Chart.svg.svelte';
import Arc from '../../Arc/Arc.svg.svelte';
import ArcLabel from '../../ArcLabel/ArcLabel.svg.svelte';
import Group from '../../Group/Group.svg.svelte';
import Pie from '../../Pie/Pie.svg.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function PieChart_svg($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	PieChartBase($$anchor, $.spread_props(
		{
			get Chart() {
				return Chart;
			},

			get Arc() {
				return Arc;
			},

			get ArcLabel() {
				return ArcLabel;
			},

			get Group() {
				return Group;
			},

			get Pie() {
				return Pie;
			}
		},
		() => props
	));
}