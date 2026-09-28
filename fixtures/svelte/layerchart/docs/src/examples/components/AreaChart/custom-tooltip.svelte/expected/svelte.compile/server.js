import * as $ from 'svelte/internal/server';
import { AreaChart, defaultChartPadding, Tooltip } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';
import { format } from '@layerstack/utils';

export default function Custom_tooltip($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });

		{
			function tooltip($$renderer, { context }) {
				{
					function children($$renderer, { data }) {
						$$renderer.push(`<!---->${$.escape(context.y(data))}`);
					}

					if (Tooltip.Root) {
						$$renderer.push('<!--[-->');

						Tooltip.Root($$renderer, {
							x: context.padding.left,
							y: 'data',
							anchor: 'right',
							contained: false,
							variant: 'none',
							class: 'text-[10px] font-semibold text-primary bg-surface-100 mt-[2px] px-1 py-[2px] border border-primary rounded-sm whitespace-nowrap',
							children,
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}

				$$renderer.push(` `);

				{
					function children($$renderer, { data }) {
						$$renderer.push(`<!---->${$.escape(format(context.x(data), 'day'))}`);
					}

					if (Tooltip.Root) {
						$$renderer.push('<!--[-->');

						Tooltip.Root($$renderer, {
							x: 'data',
							y: context.height,
							anchor: 'top',
							contained: false,
							variant: 'none',
							class: 'text-[10px] font-semibold text-primary bg-surface-100 mt-[2px] px-2 py-[2px] border border-primary rounded-sm whitespace-nowrap',
							children,
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}
			}

			AreaChart($$renderer, {
				data,
				x: 'date',
				y: 'value',
				padding: defaultChartPadding({ right: 10 }),
				height: 300,
				tooltip,
				$$slots: { tooltip: true }
			});
		}

		$.bind_props($$props, { data });
	});
}