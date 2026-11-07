import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart as ChartJS, DoughnutController } from 'chart.js';
import Chart from './Chart.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'chart']);

export default function Doughnut($$anchor, $$props) {
	$.push($$props, true);
	ChartJS.register(DoughnutController);

	let chart = $.prop($$props, 'chart', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	Chart($$anchor, $.spread_props({ type: 'doughnut' }, () => restProps, {
		get chart() {
			return chart();
		},

		set chart($$value) {
			chart($$value);
		}
	}));

	$.pop();
}