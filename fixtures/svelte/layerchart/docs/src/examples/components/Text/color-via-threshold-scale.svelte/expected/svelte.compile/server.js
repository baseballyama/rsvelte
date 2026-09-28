import * as $ from 'svelte/internal/server';
import { scaleThreshold } from 'd3-scale';
import { AnnotationLine, Chart, Circle, Text, Axis, Layer } from 'layerchart';

export default function Color_via_threshold_scale($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = [
			{ date: new Date('2024-01-01'), value: 10, label: 'Jan' },
			{ date: new Date('2024-03-01'), value: 35, label: 'Mar' },
			{ date: new Date('2024-05-01'), value: 22, label: 'May' },
			{ date: new Date('2024-07-01'), value: 48, label: 'Jul' },
			{ date: new Date('2024-09-01'), value: 80, label: 'Sep' },
			{ date: new Date('2024-11-01'), value: 92, label: 'Nov' }
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
			padding: { top: 30, bottom: 20, left: 24, right: 10 },
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
						Circle($$renderer, { cx: 'date', cy: 'value', r: 4, fill: 'value' });
						$$renderer.push(`<!----> `);

						Text($$renderer, {
							x: 'date',
							y: 'value',
							value: 'label',
							textAnchor: 'middle',
							dy: -8,
							fill: 'value',
							class: 'text-xs'
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