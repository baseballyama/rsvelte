import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleBand } from 'd3-scale';
import ServerChart from './ServerChart.svelte';
import Bars from '$lib/components/Bars/Bars.svelte';

export default function TestBarChart($$anchor, $$props) {
	$.push($$props, true);

	{
		let $0 = $.derived(() => scaleBand().paddingInner(0.2).paddingOuter(0.1));

		ServerChart($$anchor, {
			get capture() {
				return $$props.capture;
			},

			get onCapture() {
				return $$props.onCapture;
			},

			get width() {
				return $$props.width;
			},

			get height() {
				return $$props.height;
			},

			get data() {
				return $$props.data;
			},
			x: 'category',
			get xScale() {
				return $.get($0);
			},
			y: 'value',
			yDomain: [0, null],
			padding: { top: 20, right: 20, bottom: 30, left: 40 },
			children: ($$anchor, $$slotProps) => {
				Bars($$anchor, { fill: 'rgb(59, 130, 246)', radius: 4 });
			},
			$$slots: { default: true }
		});
	}

	$.pop();
}