import * as $ from 'svelte/internal/server';
import { Axis, Chart, Layer } from 'layerchart';
import { timeDay } from 'd3-time';
import { startOfInterval } from '@layerstack/utils';

export default function Multiple_axis_grid_with_single_rule($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const today = startOfInterval('day', new Date());

		Chart($$renderer, {
			xDomain: [timeDay.offset(today, -10), today],
			yDomain: [0, 100],
			yNice: true,
			padding: { top: 20, bottom: 20, left: 20, right: 20 },
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'left', grid: true });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'bottom', grid: true, rule: true });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});
}