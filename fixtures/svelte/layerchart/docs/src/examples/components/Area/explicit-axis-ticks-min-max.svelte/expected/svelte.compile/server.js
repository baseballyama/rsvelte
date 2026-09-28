import * as $ from 'svelte/internal/server';
import { Area, Axis, Chart, Layer, Text } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Explicit_axis_ticks_min_max($$renderer, $$props) {
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

						{
							function tickLabel($$renderer, { props, index }) {
								Text($$renderer, $.spread_props([props, { textAnchor: index ? 'end' : 'start' }]));
							}

							Axis($$renderer, {
								placement: 'bottom',
								format: 'day',
								rule: true,
								ticks: (scale) => scale.domain(),
								tickLabel,
								$$slots: { tickLabel: true }
							});
						}

						$$renderer.push(`<!----> `);

						Area($$renderer, {
							line: { class: 'stroke-2 stroke-primary' },
							class: 'fill-primary/30'
						});

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