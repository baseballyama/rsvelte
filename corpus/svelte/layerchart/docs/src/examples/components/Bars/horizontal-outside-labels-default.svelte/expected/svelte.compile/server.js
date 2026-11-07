import * as $ from 'svelte/internal/server';
import { scaleBand } from 'd3-scale';
import { Bars, Axis, Chart, Labels, Layer, Rule } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Horizontal_outside_labels_default($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ min: -20, max: 50, value: 'integer' });

		Chart($$renderer, {
			data,
			x: 'value',
			xNice: true,
			xPadding: [20, 20],
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
						Rule($$renderer, { x: 0 });
						$$renderer.push(`<!----> `);
						Bars($$renderer, { strokeWidth: 1, class: 'fill-primary' });
						$$renderer.push(`<!----> `);
						Labels($$renderer, { format: 'integer' });
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