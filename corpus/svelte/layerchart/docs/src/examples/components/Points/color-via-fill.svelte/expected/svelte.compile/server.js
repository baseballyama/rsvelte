import * as $ from 'svelte/internal/server';
import { scaleThreshold } from 'd3-scale';
import { Axis, Chart, Layer, Points } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Color_via_fill($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ min: 10, max: 100, value: 'integer' });

		Chart($$renderer, {
			data,
			x: 'date',
			y: 'value',
			yDomain: [0, null],
			yNice: true,
			padding: 20,
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'left', grid: true, rule: true });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'bottom', rule: true });
						$$renderer.push(`<!----> `);
						Points($$renderer, { fill: 'red' });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$.bind_props($$props, { data });
	});
}