import * as $ from 'svelte/internal/server';
import { scaleBand } from 'd3-scale';
import { Axis, Bars, Chart, Layer, LinearGradient } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Vertical_gradient($$renderer, $$props) {
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

						{
							function children($$renderer, { gradient }) {
								Bars($$renderer, { strokeWidth: 1, fill: gradient, class: 'stroke-blue-900' });
							}

							LinearGradient($$renderer, {
								class: 'from-blue-500 to-green-400',
								vertical: true,
								units: 'userSpaceOnUse',
								children,
								$$slots: { default: true }
							});
						}

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