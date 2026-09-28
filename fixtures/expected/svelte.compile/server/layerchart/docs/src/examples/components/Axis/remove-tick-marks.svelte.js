import * as $ from 'svelte/internal/server';
import { Axis, Chart, Layer, defaultChartPadding } from 'layerchart';
import { timeDay } from 'd3-time';
import { startOfInterval } from '@layerstack/utils';

export default function Remove_tick_marks($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const today = startOfInterval('day', new Date());

		Chart($$renderer, {
			xDomain: [timeDay.offset(today, -10), today],
			padding: defaultChartPadding({ bottom: 40 }),
			height: 48,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'bottom', rule: true, tickMarks: false });
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});
}