import * as $ from 'svelte/internal/server';
import { Axis, Chart, Layer } from 'layerchart';
import { timeDay } from 'd3-time';
import { startOfInterval } from '@layerstack/utils';

export default function Tick_label_styling($$renderer, $$props) {
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
							classes: {
								rule: 'stroke-primary',
								tick: 'stroke-primary/50',
								tickLabel: 'fill-primary font-semibold'
							}
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});
}