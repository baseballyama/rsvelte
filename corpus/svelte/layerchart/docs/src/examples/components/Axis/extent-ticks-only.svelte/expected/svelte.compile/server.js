import * as $ from 'svelte/internal/server';
import { Axis, Chart, Layer, Text } from 'layerchart';
import { timeDay } from 'd3-time';
import { startOfInterval } from '@layerstack/utils';

export default function Extent_ticks_only($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const today = startOfInterval('day', new Date());

		Chart($$renderer, {
			xDomain: [timeDay.offset(today, -10), today],
			yDomain: [0, 100],
			padding: { top: 20, bottom: 20, left: 20, right: 20 },
			height: 200,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						{
							function tickLabel($$renderer, { props, index }) {
								Text($$renderer, $.spread_props([props, { textAnchor: index === 0 ? 'start' : 'end' }]));
							}

							Axis($$renderer, {
								placement: 'bottom',
								rule: true,
								ticks: (scale) => scale.domain(),
								format: { type: 'day', options: { variant: 'long' } },
								tickLabel,
								$$slots: { tickLabel: true }
							});
						}

						$$renderer.push(`<!----> `);

						Axis($$renderer, {
							placement: 'left',
							rule: true,
							ticks: (scale) => scale.domain()
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