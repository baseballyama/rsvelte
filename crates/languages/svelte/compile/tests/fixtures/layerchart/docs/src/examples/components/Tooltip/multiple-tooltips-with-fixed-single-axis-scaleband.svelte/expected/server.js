import * as $ from 'svelte/internal/server';
import { format } from '@layerstack/utils';
import { timeDay } from 'd3-time';
import { Bars, Axis, Chart, Layer, Highlight, Tooltip } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Multiple_tooltips_with_fixed_single_axis_scaleband($$renderer, $$props) {
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
						Bars($$renderer, { radius: 4, strokeWidth: 1, class: 'fill-primary' });
						$$renderer.push(`<!----> `);
						Highlight($$renderer, { area: true });
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
							x: 'data',
							y: 'data',
							yOffset: 2,
							anchor: 'bottom',
							contained: false,
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
							contained: false,
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
				xInterval: timeDay,
				y: 'value',
				yDomain: [0, null],
				yNice: true,
				padding: { left: 16, bottom: 24, top: 16, right: 16 },
				tooltipContext: { mode: 'band' },
				height: 300,
				children,
				$$slots: { default: true }
			});
		}

		$.bind_props($$props, { data });
	});
}