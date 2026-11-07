import * as $ from 'svelte/internal/server';
import { scaleBand } from 'd3-scale';
import { Axis, Bars, Chart, Highlight, Layer, Tooltip } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Vertical_multiple_overlapping($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ count: 20, min: 20, max: 80, keys: ['value', 'baseline'] });

		$$renderer.push(`<div class="h-[300px] p-4 border rounded-sm">`);

		Chart($$renderer, {
			data,
			x: 'date',
			xScale: scaleBand().padding(0.4),
			y: ['value', 'baseline'],
			yDomain: [0, null],
			yNice: true,
			padding: { left: 24, bottom: 20, top: 8 },
			tooltipContext: { mode: 'bisect-x' },
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'left', grid: true, rule: true });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'bottom', rule: true });
						$$renderer.push(`<!----> `);

						Bars($$renderer, {
							y: 'baseline',
							strokeWidth: 1,
							class: 'fill-surface-content/20'
						});

						$$renderer.push(`<!----> `);

						Bars($$renderer, {
							y: 'value',
							strokeWidth: 1,
							insets: { x: 4 },
							class: 'fill-primary'
						});

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

		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { data });
	});
}