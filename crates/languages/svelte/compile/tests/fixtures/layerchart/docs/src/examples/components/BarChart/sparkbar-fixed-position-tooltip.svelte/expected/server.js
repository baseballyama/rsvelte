import * as $ from 'svelte/internal/server';
import { BarChart, Tooltip } from 'layerchart';
import { format } from '@layerstack/utils';
import { createDateSeries } from '$lib/utils/data.js';

export default function Sparkbar_fixed_position_tooltip($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ count: 30, min: 20, max: 100 });

		{
			function tooltip($$renderer, { context }) {
				{
					function children($$renderer, { data }) {
						$$renderer.push(`<div class="whitespace-nowrap">${$.escape(format(data.date, 'day'))}</div> <div class="font-semibold">${$.escape(format(data.value, 'decimal'))}</div>`);
					}

					if (Tooltip.Root) {
						$$renderer.push('<!--[-->');

						Tooltip.Root($$renderer, {
							context,
							class: 'text-xs',
							contained: false,
							variant: 'none',
							y: -10,
							x: context.width + 8,
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

			BarChart($$renderer, {
				data,
				x: 'date',
				y: 'value',
				axis: false,
				grid: false,
				bandPadding: 0.1,
				props: { bars: { radius: 1, strokeWidth: 0 } },
				width: 124,
				height: 18,
				tooltip,
				$$slots: { tooltip: true }
			});
		}

		$.bind_props($$props, { data });
	});
}