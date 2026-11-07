import * as $ from 'svelte/internal/server';
import { LineChart, Tooltip } from 'layerchart';
import { format } from '@layerstack/utils';
import { createDateSeries } from '$lib/utils/data.js';

export default function Sparkline_fixed_position_tooltip($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ count: 50, min: 50, max: 100 });

		{
			function tooltip($$renderer, { context }) {
				{
					function children($$renderer, { data }) {
						$$renderer.push(`<div class="whitespace-nowrap">${$.escape(format(data.date, 'day'))}</div> <div class="font-semibold">${$.escape(data.value)}</div>`);
					}

					if (Tooltip.Root) {
						$$renderer.push('<!--[-->');

						Tooltip.Root($$renderer, {
							context,
							class: 'text-xs',
							contained: false,
							y: -3,
							x: context.width + 8,
							variant: 'none',
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

			LineChart($$renderer, {
				data,
				x: 'date',
				y: 'value',
				yDomain: null,
				axis: false,
				grid: false,
				props: {
					highlight: { points: { r: 3, class: 'stroke-2 stroke-surface-100' } }
				},
				width: 124,
				height: 24,
				tooltip,
				$$slots: { tooltip: true }
			});
		}

		$.bind_props($$props, { data });
	});
}