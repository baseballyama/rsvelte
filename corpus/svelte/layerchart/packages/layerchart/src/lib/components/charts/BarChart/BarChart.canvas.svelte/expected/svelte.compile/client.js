import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import BarChartBase from './BarChart.base.svelte';
import Chart from '../../Chart/Chart.canvas.svelte';
import Bars from '../../Bars/Bars.canvas.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function BarChart_canvas($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	BarChartBase($$anchor, $.spread_props(
		{
			get Chart() {
				return Chart;
			},

			get Bars() {
				return Bars;
			}
		},
		() => props
	));
}