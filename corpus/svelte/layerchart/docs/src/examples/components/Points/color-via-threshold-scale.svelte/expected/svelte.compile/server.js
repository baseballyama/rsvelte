import * as $ from 'svelte/internal/server';
import { scaleThreshold } from 'd3-scale';
import { AnnotationLine, Axis, Chart, Layer, Points } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Color_via_threshold_scale($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ min: 10, max: 100, value: 'integer' });

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
			padding: 20,
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'left', grid: true, rule: true });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'bottom', rule: true });
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
							class: '[stroke-dasharray:4] opacity-20',
							props: {
								line: {
									dashArray: [4],
									stroke: 'var(--color-success)',
									strokeOpacity: 0.5
								}
							}
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