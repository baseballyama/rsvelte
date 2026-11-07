import * as $ from 'svelte/internal/server';
import { Chart, Layer, Pie } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Partial_range_chart_xrange($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ min: 20, max: 100, value: 'integer', count: 4 });

		const keyColors = [
			'var(--color-info)',
			'var(--color-success)',
			'var(--color-warning)',
			'var(--color-danger)'
		];

		Chart($$renderer, {
			data,
			x: 'value',
			c: 'date',
			xRange: [-90, 90],
			cRange: keyColors,
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					center: true,
					children: ($$renderer) => {
						Pie($$renderer, {});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$.bind_props($$props, { data });
	});
}