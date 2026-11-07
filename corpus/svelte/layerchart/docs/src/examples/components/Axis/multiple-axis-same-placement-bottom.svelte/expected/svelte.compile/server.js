import * as $ from 'svelte/internal/server';
import { Axis, Chart, Layer, defaultChartPadding } from 'layerchart';
import { timeMonth, timeYear } from 'd3-time';
import { startOfInterval } from '@layerstack/utils';

export default function Multiple_axis_same_placement_bottom($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const today = startOfInterval('day', new Date());

		Chart($$renderer, {
			xDomain: [timeYear.offset(today, -2), today],
			padding: defaultChartPadding({ bottom: 32 }),
			height: 48,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, {
							placement: 'bottom',
							ticks: { interval: timeMonth.every(3) },
							format: (d) => 'Q' + (d.getMonth() / 3 + 1),
							rule: true
						});

						$$renderer.push(`<!----> `);

						Axis($$renderer, {
							placement: 'bottom',
							ticks: { interval: timeYear.every(1) },
							tickLength: 0,
							tickLabelProps: { dy: 20, class: 'text-sm' }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});
}