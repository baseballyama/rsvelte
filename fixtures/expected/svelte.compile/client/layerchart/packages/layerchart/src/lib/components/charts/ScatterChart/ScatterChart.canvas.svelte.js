import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ScatterChartBase from './ScatterChart.base.svelte';
import Chart from '../../Chart/Chart.canvas.svelte';
import Points from '../../Points/Points.canvas.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function ScatterChart_canvas($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	ScatterChartBase($$anchor, $.spread_props(
		{
			get Chart() {
				return Chart;
			},

			get Points() {
				return Points;
			}
		},
		() => props
	));
}