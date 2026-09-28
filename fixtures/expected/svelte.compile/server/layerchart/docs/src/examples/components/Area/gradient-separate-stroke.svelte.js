import * as $ from 'svelte/internal/server';
import { Area, Axis, Chart, Layer, LinearGradient } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Gradient_separate_stroke($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });

		Chart($$renderer, {
			data,
			x: 'date',
			y: 'value',
			yDomain: [0, null],
			yNice: true,
			padding: 20,
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'left', grid: true, rule: true });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'bottom', rule: true });
						$$renderer.push(`<!----> `);

						{
							function children($$renderer, { gradient: strokeGradient }) {
								{
									function children($$renderer, { gradient: fillGradient }) {
										Area($$renderer, {
											line: { stroke: strokeGradient, class: 'stroke-2' },
											fill: fillGradient
										});
									}

									LinearGradient($$renderer, {
										class: 'from-primary/50 to-primary/1',
										vertical: true,
										children,
										$$slots: { default: true }
									});
								}
							}

							LinearGradient($$renderer, {
								class: 'from-secondary/1 to-secondary',
								children,
								$$slots: { default: true }
							});
						}

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