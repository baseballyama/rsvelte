import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ScatterChartBase from './ScatterChart.base.svelte';
import Chart from '../../Chart/Chart.svelte';
import Points from '../../Points/Points.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'context']);

export default function ScatterChart($$anchor, $$props) {
	$.push($$props, true);

	let context = $.prop($$props, 'context', 15),
		props = $.rest_props($$props, rest_excludes);

	ScatterChartBase($$anchor, $.spread_props(
		{
			get Chart() {
				return Chart;
			},

			get Points() {
				return Points;
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