import * as $ from 'svelte/internal/server';

import {
	Area,
	Axis,
	Chart,
	Highlight,
	Layer,
	RectClipPath,
	Rule,
	Tooltip
} from 'layerchart';

import { createDateSeries } from '$lib/utils/data.js';

export default function Highlight_color_based_on_value_using_tooltip_slot_prop($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ count: 30, min: -20, max: 50, value: 'integer' });

		{
			function children($$renderer, { context }) {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'left', grid: true, rule: true });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'bottom' });
						$$renderer.push(`<!----> `);
						Rule($$renderer, { y: 0 });
						$$renderer.push(`<!----> `);

						RectClipPath($$renderer, {
							x: 0,
							y: 0,
							width: context.width,
							height: context.yScale(0),
							children: ($$renderer) => {
								Area($$renderer, {
									y0: (d) => 0,
									line: { class: 'stroke-2 stroke-success' },
									class: 'fill-success/20'
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						RectClipPath($$renderer, {
							x: 0,
							y: context.yScale(0),
							width: context.width,
							height: context.height - context.yScale(0),
							children: ($$renderer) => {
								Area($$renderer, {
									y0: (d) => 0,
									line: { class: 'stroke-2 stroke-danger' },
									class: 'fill-danger/20'
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Highlight($$renderer, {
							lines: {
								class: context.tooltip.data
									? context.tooltip.data?.value < 0 ? 'stroke-danger' : 'stroke-success'
									: undefined
							},
							points: {
								class: context.tooltip.data
									? context.tooltip.data?.value < 0 ? 'fill-danger' : 'fill-success'
									: undefined
							}
						});

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
			}

			Chart($$renderer, {
				data,
				x: 'date',
				y: 'value',
				yNice: true,
				padding: 20,
				tooltipContext: { mode: 'quadtree-x' },
				height: 300,
				children,
				$$slots: { default: true }
			});
		}

		$.bind_props($$props, { data });
	});
}