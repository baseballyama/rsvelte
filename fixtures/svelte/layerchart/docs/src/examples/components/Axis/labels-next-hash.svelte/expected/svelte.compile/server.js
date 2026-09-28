import * as $ from 'svelte/internal/server';
import { Axis, Chart, Layer } from 'layerchart';
import { timeDay } from 'd3-time';
import { startOfInterval } from '@layerstack/utils';

export default function Labels_next_hash($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const today = startOfInterval('day', new Date());

		Chart($$renderer, {
			xDomain: [timeDay.offset(today, -10), today],
			padding: 24,
			height: 48,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, {
							placement: 'bottom',
							rule: true,
							tickLabelProps: { textAnchor: 'start', dx: 8, dy: 4 },
							ticks: (scale) => scale.ticks?.().slice(0, -1),
							tickLength: 22
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});
}