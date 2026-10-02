import * as $ from 'svelte/internal/server';
import { ScatterChart, Tooltip } from 'layerchart';
import { getSpiral } from '$lib/utils/data.js';
import { format } from '@layerstack/utils';

export default function Custom_tooltip($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = getSpiral({
			angle: 137.5,
			radius: 10,
			count: 100,
			width: 500,
			height: 500
		});

		{
			function tooltip($$renderer, { context }) {
				{
					function children($$renderer, { data }) {
						$$renderer.push(`<!---->${$.escape(format(context.y(data), 'integer'))}`);
					}

					if (Tooltip.Root) {
						$$renderer.push('<!--[-->');

						Tooltip.Root($$renderer, {
							x: context.padding.left,
							y: 'data',
							anchor: 'right',
							contained: false,
							variant: 'none',
							class: 'text-[10px] font-semibold text-primary bg-surface-100 mr-[2px] px-1 py-[2px] border border-primary rounded-sm whitespace-nowrap',
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
						$$renderer.push(`<!---->${$.escape(format(context.x(data), 'integer'))}`);
					}

					if (Tooltip.Root) {
						$$renderer.push('<!--[-->');

						Tooltip.Root($$renderer, {
							x: 'data',
							y: context.height,
							anchor: 'top',
							class: 'text-[10px] font-semibold text-primary bg-surface-100 mt-[1px] px-2 py-[1px] border border-primary rounded-sm whitespace-nowrap',
							variant: 'none',
							contained: false,
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

			ScatterChart($$renderer, {
				data,
				xNice: true,
				x: 'x',
				y: 'y',
				padding: 24,
				height: 400,
				tooltip,
				$$slots: { tooltip: true }
			});
		}

		$.bind_props($$props, { data });
	});
}