import * as $ from 'svelte/internal/server';
import { Chart, Rect, Axis, Layer } from 'layerchart';
import { bin } from 'd3-array';

export default function Data_mode_edge($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const raw = [
			12,
			15,
			18,
			21,
			23,
			25,
			27,
			28,
			30,
			32,
			34,
			35,
			37,
			38,
			40,
			42,
			44,
			45,
			48,
			50,
			52,
			55,
			58,
			60,
			62,
			65,
			68,
			70,
			72,
			75
		];

		const histogram = bin().thresholds(8)(raw);
		const data = histogram.map((b) => ({ x0: b.x0, x1: b.x1, count: b.length }));

		Chart($$renderer, {
			data,
			x: ['x0', 'x1'],
			y: 'count',
			yDomain: [0, null],
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

						Rect($$renderer, {
							x0: 'x0',
							y0: (d) => 0,
							x1: 'x1',
							y1: 'count',
							insets: { x: 1 },
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