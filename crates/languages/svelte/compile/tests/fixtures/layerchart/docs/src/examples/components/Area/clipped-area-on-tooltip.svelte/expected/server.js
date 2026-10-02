import * as $ from 'svelte/internal/server';

import {
	Area,
	Axis,
	Chart,
	Highlight,
	Layer,
	LinearGradient,
	RectClipPath,
	Tooltip
} from 'layerchart';

import { format } from '@layerstack/utils';
import { getAppleStock } from '$lib/data.remote';

const data = await getAppleStock();

export default function Clipped_area_on_tooltip($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		{
			function children($$renderer, { context }) {
				Layer($$renderer, {
					children: ($$renderer) => {
						{
							function children($$renderer, { gradient }) {
								Area($$renderer, {
									line: { class: 'stroke-2 stroke-primary opacity-20' },
									fill: gradient
								});

								$$renderer.push(`<!----> `);

								RectClipPath($$renderer, {
									x: 0,
									y: 0,
									width: context.tooltip.data ? context.tooltip.x : context.width,
									height: context.height,
									motion: 'spring',
									children: ($$renderer) => {
										Area($$renderer, { line: { class: 'stroke-2 stroke-primary' }, fill: gradient });
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							}

							LinearGradient($$renderer, {
								class: 'from-primary/50 to-primary/1',
								vertical: true,
								children,
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!----> `);

						Highlight($$renderer, {
							points: true,
							lines: { class: 'stroke-primary [stroke-dasharray:unset]' }
						});

						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'bottom' });
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
							y: 24,
							xOffset: 4,
							variant: 'none',
							class: 'text-sm font-semibold text-primary leading-3',
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
							x: 4,
							y: 4,
							variant: 'none',
							class: 'text-sm font-semibold leading-3',
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
				y: 'value',
				yDomain: [0, null],
				yNice: true,
				padding: { top: 20, bottom: 20 },
				tooltipContext: { mode: 'quadtree-x' },
				height: 300,
				children,
				$$slots: { default: true }
			});
		}

		$.bind_props($$props, { data });
	});
}