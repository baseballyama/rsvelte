import * as $ from 'svelte/internal/server';
import { scaleBand } from 'd3-scale';
import { Axis, Bars, Chart, Layer } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Vertical_rounded_top_only($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ count: 20, min: 20, max: 100 });

		Chart($$renderer, {
			data,
			x: 'date',
			xScale: scaleBand().padding(0.4),
			y: 'value',
			yDomain: [0, null],
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

						Bars($$renderer, {
							radius: 4,
							rounded: 'top',
							strokeWidth: 1,
							class: 'fill-primary'
						});

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