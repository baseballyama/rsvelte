import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import AreaChartBase from './AreaChart.base.svelte';
import Chart from '../../Chart/Chart.canvas.svelte';
import Area from '../../Area/Area.canvas.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function AreaChart_canvas($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	AreaChartBase($$anchor, $.spread_props(
		{
			get Chart() {
				return Chart;
			},

			get Area() {
				return Area;
			}
		},
		() => props
	));
}