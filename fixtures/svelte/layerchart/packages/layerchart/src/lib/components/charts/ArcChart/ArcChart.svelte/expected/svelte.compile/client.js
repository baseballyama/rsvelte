import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ArcChartBase from './ArcChart.base.svelte';
import Chart from '../../Chart/Chart.svelte';
import Arc from '../../Arc/Arc.svelte';
import ArcLabel from '../../ArcLabel/ArcLabel.svelte';
import Group from '../../Group/Group.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'context']);

export default function ArcChart($$anchor, $$props) {
	$.push($$props, true);

	let context = $.prop($$props, 'context', 15),
		props = $.rest_props($$props, rest_excludes);

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
		() => props,
		{
			get context() {
				return context();
			},

			set context($$value) {
				context($$value);
			}
		}
	));

	$.pop();
}