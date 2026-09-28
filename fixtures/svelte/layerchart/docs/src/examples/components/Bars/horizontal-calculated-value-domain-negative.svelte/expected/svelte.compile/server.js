import * as $ from 'svelte/internal/server';
import { scaleBand } from 'd3-scale';
import { Bars, Axis, Chart, Layer } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Horizontal_calculated_value_domain_negative($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ count: 10, min: -100, max: -50 });

		Chart($$renderer, {
			data,
			x: 'value',
			xNice: true,
			y: 'date',
			yScale: scaleBand().padding(0.4),
			padding: { left: 32, bottom: 20, right: 8 },
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'bottom', grid: true, rule: true });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'left', rule: true });
						$$renderer.push(`<!----> `);
						Bars($$renderer, { strokeWidth: 1, class: 'fill-primary' });
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