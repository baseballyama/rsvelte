import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import LineChartBase from './LineChart.base.svelte';
import Chart from '../../Chart/Chart.svg.svelte';
import Spline from '../../Spline/Spline.svg.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function LineChart_svg($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	LineChartBase($$anchor, $.spread_props(
		{
			get Chart() {
				return Chart;
			},

			get Spline() {
				return Spline;
			}
		},
		() => props
	));
}