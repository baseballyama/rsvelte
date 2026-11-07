import * as $ from 'svelte/internal/server';
import { scaleBand } from 'd3-scale';
import { Axis, Bars, Chart, Layer } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Vertical_with_grid_on_top_mix_blend($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ count: 20, min: 20, max: 100 });

		Chart($$renderer, {
			data,
			x: 'date',
			xScale: scaleBand().padding(0.4),
			y: 'value',
			yNice: true,
			padding: { left: 24, bottom: 20, top: 8 },
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Bars($$renderer, { strokeWidth: 1, class: 'fill-primary' });
						$$renderer.push(`<!----> `);

						Axis($$renderer, {
							placement: 'left',
							grid: { class: 'mix-blend-multiply' },
							rule: true
						});

						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'bottom', rule: true });
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