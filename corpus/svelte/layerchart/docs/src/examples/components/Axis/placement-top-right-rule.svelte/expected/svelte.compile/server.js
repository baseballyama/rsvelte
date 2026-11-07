import * as $ from 'svelte/internal/server';
import { Axis, Chart, Layer } from 'layerchart';
import { timeDay } from 'd3-time';
import { startOfInterval } from '@layerstack/utils';

export default function Placement_top_right_rule($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const today = startOfInterval('day', new Date());

		Chart($$renderer, {
			xDomain: [timeDay.offset(today, -10), today],
			yDomain: [0, 100],
			yNice: true,
			padding: { top: 20, bottom: 20, left: 20, right: 30 },
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'top', rule: true });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'right', rule: true });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});
}