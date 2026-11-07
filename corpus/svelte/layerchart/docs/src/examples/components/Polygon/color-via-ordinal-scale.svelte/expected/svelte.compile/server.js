import * as $ from 'svelte/internal/server';
import { Chart, Polygon, Axis, Layer } from 'layerchart';

export default function Color_via_ordinal_scale($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = [
			{ date: new Date('2024-01-01'), value: 10, category: 'A' },
			{ date: new Date('2024-03-01'), value: 35, category: 'B' },
			{ date: new Date('2024-05-01'), value: 22, category: 'A' },
			{ date: new Date('2024-07-01'), value: 48, category: 'B' },
			{ date: new Date('2024-09-01'), value: 30, category: 'A' },
			{ date: new Date('2024-11-01'), value: 55, category: 'B' }
		];

		Chart($$renderer, {
			data,
			x: 'date',
			y: 'value',
			yNice: true,
			c: 'category',
			cRange: ['var(--color-primary)', 'var(--color-secondary)'],
			padding: { top: 20, bottom: 20, left: 24, right: 10 },
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'bottom', rule: true });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'left', rule: true });
						$$renderer.push(`<!----> `);
						Polygon($$renderer, { cx: 'date', cy: 'value', r: 8, points: 6, fill: 'category' });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});
}