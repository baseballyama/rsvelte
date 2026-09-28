import * as $ from 'svelte/internal/server';
import { scaleBand } from 'd3-scale';
import { format } from '@layerstack/utils';

import {
	Axis,
	Bars,
	Chart,
	Highlight,
	Layer,
	Rule,
	Tooltip,
	defaultChartPadding
} from 'layerchart';

import { createDateSeries } from '$lib/utils/data.js';

export default function Vertical_multiple_diverging_rounded_specific($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({
			count: 30,
			min: 20,
			max: 100,
			value: 'integer',
			keys: ['value', 'baseline']
		});

		Chart($$renderer, {
			data,
			x: 'date',
			xScale: scaleBand().padding(0.4),
			y: ['value', (d) => -d.baseline],
			yNice: true,
			tooltipContext: { mode: 'bisect-x' },
			padding: defaultChartPadding({ top: 10, left: 20 }),
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, {
							placement: 'left',
							grid: true,
							rule: true,
							format: (d) => format(Math.abs(d), 'integer')
						});

						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'bottom' });
						$$renderer.push(`<!----> `);

						Bars($$renderer, {
							y: 'value',
							'rounded-sm': 'top',
							strokeWidth: 1,
							class: 'fill-primary'
						});

						$$renderer.push(`<!----> `);

						Bars($$renderer, {
							y: (d) => -d.baseline,
							rounded: 'bottom',
							strokeWidth: 1,
							class: 'fill-secondary'
						});

						$$renderer.push(`<!----> `);
						Rule($$renderer, { y: 0 });
						$$renderer.push(`<!----> `);
						Highlight($$renderer, { area: true });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				{
					function children($$renderer, { data }) {
						if (Tooltip.Header) {
							$$renderer.push('<!--[-->');
							Tooltip.Header($$renderer, { value: data.date, format: 'day' });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Tooltip.List) {
							$$renderer.push('<!--[-->');

							Tooltip.List($$renderer, {
								children: ($$renderer) => {
									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');
										Tooltip.Item($$renderer, { label: 'value', value: data.value });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');
										Tooltip.Item($$renderer, { label: 'baseline', value: data.baseline });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}

					if (Tooltip.Root) {
						$$renderer.push('<!--[-->');
						Tooltip.Root($$renderer, { children, $$slots: { default: true } });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}
			},
			$$slots: { default: true }
		});

		$.bind_props($$props, { data });
	});
}