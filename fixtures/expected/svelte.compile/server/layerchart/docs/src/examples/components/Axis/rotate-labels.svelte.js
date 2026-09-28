import * as $ from 'svelte/internal/server';
import { Axis, Chart, Layer, defaultChartPadding } from 'layerchart';
import { timeDay } from 'd3-time';
import { startOfInterval } from '@layerstack/utils';

export default function Rotate_labels($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const today = startOfInterval('day', new Date());

		Chart($$renderer, {
			xDomain: [timeDay.offset(today, -10), today],
			padding: defaultChartPadding({ bottom: 60, top: 24, left: 24, right: 24 }),
			height: 52,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, {
							placement: 'bottom',
							rule: true,
							tickLabelProps: { rotate: 315, textAnchor: 'end' }
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});
}