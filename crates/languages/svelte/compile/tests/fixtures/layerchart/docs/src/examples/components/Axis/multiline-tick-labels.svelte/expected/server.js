import * as $ from 'svelte/internal/server';
import { Axis, Chart, Layer, defaultChartPadding } from 'layerchart';
import { timeMonth, timeYear } from 'd3-time';
import { startOfInterval } from '@layerstack/utils';

export default function Multiline_tick_labels($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const today = startOfInterval('day', new Date());

		Chart($$renderer, {
			xDomain: [timeYear.offset(today, -2), today],
			padding: defaultChartPadding({ bottom: 30 }),
			height: 48,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, {
							placement: 'bottom',
							ticks: { interval: timeMonth.every(3) },
							format: (d) => 'Q' + (d.getMonth() / 3 + 1) + (d.getMonth() === 0 ? '\n' + d.getFullYear() : ''),
							rule: true
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});
}