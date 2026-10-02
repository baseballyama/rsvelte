import * as $ from 'svelte/internal/server';
import { Chart, Layer, Pie } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Multiple_data_prop($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ min: 20, max: 100, value: 'integer', count: 4 });
		const data2 = createDateSeries({ min: 20, max: 100, value: 'integer', count: 4 });

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
			cRange: keyColors,
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					center: true,
					children: ($$renderer) => {
						Pie($$renderer, { innerRadius: 100, data });
						$$renderer.push(`<!----> `);
						Pie($$renderer, { outerRadius: 90, data: data2 });
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