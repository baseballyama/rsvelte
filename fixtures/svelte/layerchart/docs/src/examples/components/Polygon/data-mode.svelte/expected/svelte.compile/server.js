import * as $ from 'svelte/internal/server';
import { Chart, Polygon, Axis, Layer } from 'layerchart';

export default function Data_mode($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = [
			{ date: new Date('2024-01-01'), value: 10 },
			{ date: new Date('2024-03-01'), value: 35 },
			{ date: new Date('2024-05-01'), value: 22 },
			{ date: new Date('2024-07-01'), value: 48 },
			{ date: new Date('2024-09-01'), value: 30 },
			{ date: new Date('2024-11-01'), value: 55 }
		];

		Chart($$renderer, {
			data,
			x: 'date',
			y: 'value',
			yNice: true,
			padding: { top: 20, bottom: 20, left: 24, right: 10 },
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'bottom', rule: true });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'left', rule: true });
						$$renderer.push(`<!----> `);

						Polygon($$renderer, {
							cx: 'date',
							cy: 'value',
							r: 8,
							points: 6,
							class: 'fill-primary'
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});
}