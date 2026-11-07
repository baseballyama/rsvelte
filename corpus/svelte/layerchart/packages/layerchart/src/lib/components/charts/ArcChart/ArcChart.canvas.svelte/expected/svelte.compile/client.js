import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ArcChartBase from './ArcChart.base.svelte';
import Chart from '../../Chart/Chart.canvas.svelte';
import Arc from '../../Arc/Arc.canvas.svelte';
import ArcLabel from '../../ArcLabel/ArcLabel.canvas.svelte';
import Group from '../../Group/Group.canvas.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function ArcChart_canvas($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	ArcChartBase($$anchor, $.spread_props(
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
			}
		},
		() => props
	));
}