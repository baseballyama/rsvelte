import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import BarChartBase from './BarChart.base.svelte';
import Chart from '../../Chart/Chart.svelte';
import Bars from '../../Bars/Bars.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'context']);

export default function BarChart($$anchor, $$props) {
	$.push($$props, true);

	let context = $.prop($$props, 'context', 15),
		props = $.rest_props($$props, rest_excludes);

	BarChartBase($$anchor, $.spread_props(
		{
			get Chart() {
				return Chart;
			},

			get Bars() {
				return Bars;
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