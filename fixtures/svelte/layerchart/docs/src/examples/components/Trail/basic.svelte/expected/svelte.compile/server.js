import * as $ from 'svelte/internal/server';
import { Axis, Chart, Layer, Trail } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Basic($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ count: 30, min: 20, max: 100, value: 'integer' });

		Chart($$renderer, {
			data,
			x: 'date',
			y: 'value',
			yBaseline: 0,
			yNice: true,
			r: 'value',
			rRange: [0, 15],
			padding: 20,
			xPadding: [20, 20],
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'left', grid: true, rule: true });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'bottom', rule: true });
						$$renderer.push(`<!----> `);
						Trail($$renderer, { r: 'value', class: 'fill-primary' });
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