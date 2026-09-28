import * as $ from 'svelte/internal/server';
import { scaleThreshold } from 'd3-scale';
import { AnnotationLine, Chart, Rect, Axis, Layer } from 'layerchart';
import { bin } from 'd3-array';

export default function Color_via_threshold_scale($$renderer, $$props) {
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
			c: 'count',
			cScale: scaleThreshold(),
			cDomain: [3, 5],
			cRange: [
				'var(--color-danger)',
				'var(--color-warning)',
				'var(--color-success)'
			],
			padding: { top: 20, bottom: 20, left: 24, right: 10 },
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'bottom', rule: true });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'left', rule: true });
						$$renderer.push(`<!----> `);

						AnnotationLine($$renderer, {
							y: 3,
							props: {
								line: {
									dashArray: [4],
									stroke: 'var(--color-danger)',
									strokeOpacity: 0.5
								}
							}
						});

						$$renderer.push(`<!----> `);

						AnnotationLine($$renderer, {
							y: 5,
							props: {
								line: {
									dashArray: [4],
									stroke: 'var(--color-success)',
									strokeOpacity: 0.5
								}
							}
						});

						$$renderer.push(`<!----> `);

						Rect($$renderer, {
							x0: 'x0',
							y0: (d) => 0,
							x1: 'x1',
							y1: 'count',
							insets: { x: 1 },
							fill: 'count'
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