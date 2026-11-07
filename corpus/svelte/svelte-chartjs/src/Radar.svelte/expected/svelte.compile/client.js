import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart as ChartJS, RadarController } from 'chart.js';
import Chart from './Chart.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'chart']);

export default function Radar($$anchor, $$props) {
	$.push($$props, true);
	ChartJS.register(RadarController);

	let chart = $.prop($$props, 'chart', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	Chart($$anchor, $.spread_props({ type: 'radar' }, () => restProps, {
		get chart() {
			return chart();
		},

		set chart($$value) {
			chart($$value);
		}
	}));

	$.pop();
}