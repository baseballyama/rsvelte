import * as $ from 'svelte/internal/server';
import { Axis, Chart, Layer } from 'layerchart';
import { startOfInterval } from '@layerstack/utils';
import { timeDay } from 'd3-time';

export default function Radial_rule($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const today = startOfInterval('day', new Date());
		const yesterday = new Date(today.getTime() - 1);

		Chart($$renderer, {
			xDomain: [timeDay.offset(today, -10), yesterday],
			yDomain: [0, 100],
			radial: true,
			padding: 24,
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					center: true,
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'radius', rule: true });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'angle', rule: true });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});
}