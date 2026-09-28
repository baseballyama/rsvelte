import * as $ from 'svelte/internal/server';
import { Axis, Chart, Layer } from 'layerchart';
import { scaleLog } from 'd3-scale';

export default function Log_scale($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		Chart($$renderer, {
			xScale: scaleLog(),
			xDomain: [1, 100],
			padding: 24,
			height: 48,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'bottom', rule: true });
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});
}