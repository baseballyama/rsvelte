import * as $ from 'svelte/internal/server';

import {
	Area,
	Axis,
	Chart,
	ChartClipPath,
	Highlight,
	Layer,
	LinearGradient,
	Tooltip,
	defaultChartPadding
} from 'layerchart';

import { format } from '@layerstack/utils';
import { getAppleStock } from '$lib/data.remote';

const data = await getAppleStock();

export default function Tooltip_interop($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let xDomain = [null, null];

		{
			function children($$renderer, { context }) {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'left', grid: true, rule: true });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'bottom', rule: true });
						$$renderer.push(`<!----> `);

						ChartClipPath($$renderer, {
							children: ($$renderer) => {
								{
									function children($$renderer, { gradient }) {
										Area($$renderer, { line: { class: 'stroke-2 stroke-primary' }, fill: gradient });
									}

									LinearGradient($$renderer, {
										class: 'from-primary/50 to-primary/1',
										vertical: true,
										children,
										$$slots: { default: true }
									});
								}
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);
						Highlight($$renderer, { points: true, lines: true });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				{
					function children($$renderer, { data }) {
						$$renderer.push(`<!---->${$.escape(format(data.value, 'currency'))}`);
					}

					if (Tooltip.Root) {
						$$renderer.push('<!--[-->');

						Tooltip.Root($$renderer, {
							y: 'data',
							xOffset: 4,
							anchor: 'bottom',
							variant: 'none',
							class: 'text-sm font-semibold text-primary leading-3 bg-surface-100/80 backdrop-blur-xs px-2 py-1 rounded-sm',
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
							y: context.height + context.padding.top,
							yOffset: 2,
							anchor: 'top',
							variant: 'none',
							class: 'text-sm font-semibold bg-primary text-primary-content leading-3 px-2 py-1 rounded-sm whitespace-nowrap',
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
				xDomain,
				y: 'value',
				yDomain: [0, null],
				padding: defaultChartPadding({ left: 25, bottom: 24 }),
				tooltipContext: { mode: 'quadtree-x' },
				brush: {
					onBrushEnd: (e) => {
						xDomain = e.brush.x;
						e.brush.reset();
					}
				},
				height: 300,
				children,
				$$slots: { default: true }
			});
		}

		$.bind_props($$props, { data });
	});
}