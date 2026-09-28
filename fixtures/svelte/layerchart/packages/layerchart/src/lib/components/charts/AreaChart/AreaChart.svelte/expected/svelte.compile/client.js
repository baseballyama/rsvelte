import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import AreaChartBase from './AreaChart.base.svelte';
import Chart from '../../Chart/Chart.svelte';
import Area from '../../Area/Area.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'context']);

export default function AreaChart($$anchor, $$props) {
	$.push($$props, true);

	let context = $.prop($$props, 'context', 15),
		props = $.rest_props($$props, rest_excludes);

	AreaChartBase($$anchor, $.spread_props(
		{
			get Chart() {
				return Chart;
			},

			get Area() {
				return Area;
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