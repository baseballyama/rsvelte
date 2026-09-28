import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import LineChartBase from './LineChart.base.svelte';
import Chart from '../../Chart/Chart.svelte';
import Spline from '../../Spline/Spline.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'context']);

export default function LineChart($$anchor, $$props) {
	$.push($$props, true);

	let context = $.prop($$props, 'context', 15),
		props = $.rest_props($$props, rest_excludes);

	LineChartBase($$anchor, $.spread_props(
		{
			get Chart() {
				return Chart;
			},

			get Spline() {
				return Spline;
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