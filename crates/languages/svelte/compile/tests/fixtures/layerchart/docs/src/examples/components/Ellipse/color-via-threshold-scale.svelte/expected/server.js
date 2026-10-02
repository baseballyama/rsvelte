import * as $ from 'svelte/internal/server';
import { scaleThreshold } from 'd3-scale';
import { AnnotationLine, Chart, Ellipse, Axis, Layer } from 'layerchart';

export default function Color_via_threshold_scale($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = [
			{ date: new Date('2024-01-01'), value: 10 },
			{ date: new Date('2024-02-01'), value: 35 },
			{ date: new Date('2024-03-01'), value: 22 },
			{ date: new Date('2024-04-01'), value: 48 },
			{ date: new Date('2024-05-01'), value: 80 },
			{ date: new Date('2024-06-01'), value: 55 },
			{ date: new Date('2024-07-01'), value: 92 },
			{ date: new Date('2024-08-01'), value: 68 }
		];

		Chart($$renderer, {
			data,
			x: 'date',
			y: 'value',
			yDomain: [0, 100],
			c: 'value',
			cScale: scaleThreshold(),
			cDomain: [50, 90],
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
							y: 50,
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
							y: 90,
							props: {
								line: {
									dashArray: [4],
									stroke: 'var(--color-success)',
									strokeOpacity: 0.5
								}
							}
						});

						$$renderer.push(`<!----> `);
						Ellipse($$renderer, { cx: 'date', cy: 'value', rx: 12, ry: 6, fill: 'value' });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});
}