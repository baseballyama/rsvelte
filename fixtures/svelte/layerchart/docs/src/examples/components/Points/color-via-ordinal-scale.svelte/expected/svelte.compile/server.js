import * as $ from 'svelte/internal/server';
import { Axis, Chart, Layer, Points, Spline } from 'layerchart';
import { curveMonotoneX } from 'd3-shape';
import { createDateSeries } from '$lib/utils/data.js';

export default function Color_via_ordinal_scale($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({
			count: 10,
			max: 100,
			value: 'integer',
			keys: ['value', 'baseline']
		});

		Chart($$renderer, {
			data,
			x: 'date',
			y: 'value',
			yDomain: [0, 100],
			c: (d) => d.value >= d.baseline ? 'above' : 'below',
			cDomain: ['below', 'above'],
			cRange: ['var(--color-danger)', 'var(--color-success)'],
			padding: 20,
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'left', grid: true, rule: true });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'bottom', rule: true });
						$$renderer.push(`<!----> `);

						Spline($$renderer, {
							y: 'baseline',
							curve: curveMonotoneX,
							class: '[stroke-dasharray:4] opacity-20'
						});

						$$renderer.push(`<!----> `);
						Points($$renderer, {});
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