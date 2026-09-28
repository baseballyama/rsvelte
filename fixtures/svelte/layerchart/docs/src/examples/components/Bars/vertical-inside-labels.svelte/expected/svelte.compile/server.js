import * as $ from 'svelte/internal/server';
import { scaleBand } from 'd3-scale';
import { Axis, Bars, Chart, Labels, Layer, Rule } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Vertical_inside_labels($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ count: 20, min: -20, max: 50 });

		Chart($$renderer, {
			data,
			x: 'date',
			xScale: scaleBand().padding(0.4),
			y: 'value',
			yBaseline: 0,
			yNice: true,
			padding: { left: 24, bottom: 20, top: 8 },
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'left', grid: true, rule: true });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'bottom', rule: true });
						$$renderer.push(`<!----> `);
						Rule($$renderer, { y: 0 });
						$$renderer.push(`<!----> `);
						Bars($$renderer, { strokeWidth: 1, class: 'fill-primary' });
						$$renderer.push(`<!----> `);
						Labels($$renderer, { placement: 'inside', format: 'integer', class: 'fill-black' });
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