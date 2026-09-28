import * as $ from 'svelte/internal/server';

import {
	Area,
	Axis,
	Chart,
	Layer,
	Highlight,
	Tooltip,
	defaultChartPadding
} from 'layerchart';

import { format } from '@layerstack/utils';
import { createDateSeries } from '$lib/utils/data.js';

export default function Multiple_tooltips_with_fixed_single_axis($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({
			count: 30,
			min: 20,
			max: 100,
			value: 'integer',
			keys: ['value', 'baseline']
		});

		{
			function children($$renderer, { context }) {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'left', grid: true, rule: true });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'bottom', rule: true });
						$$renderer.push(`<!----> `);

						Area($$renderer, {
							class: 'fill-primary/30',
							line: { class: 'stroke-primary stroke-2' }
						});

						$$renderer.push(`<!----> `);
						Highlight($$renderer, { points: true, lines: true, axis: 'both' });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				{
					function children($$renderer, { data }) {
						$$renderer.push(`<!---->${$.escape(data.value)}`);
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
						$$renderer.push(`<!---->${$.escape(format(data.date, 'day'))}`);
					}

					if (Tooltip.Root) {
						$$renderer.push('<!--[-->');

						Tooltip.Root($$renderer, {
							x: 'data',
							y: context.height + context.padding.top + 2,
							anchor: 'top',
							variant: 'none',
							class: 'text-[10px] font-semibold text-primary bg-surface-100 px-2 py-[2px] border border-primary rounded-sm whitespace-nowrap',
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

			Chart($$renderer, {
				data,
				x: 'date',
				y: 'value',
				yDomain: [0, null],
				yNice: true,
				padding: defaultChartPadding({ top: 5, left: 28, bottom: 24, right: 15 }),
				tooltipContext: { mode: 'quadtree-x' },
				height: 300,
				children,
				$$slots: { default: true }
			});
		}

		$.bind_props($$props, { data });
	});
}