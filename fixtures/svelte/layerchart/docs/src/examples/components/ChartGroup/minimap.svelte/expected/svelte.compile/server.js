import * as $ from 'svelte/internal/server';
import { range } from 'd3-array';

import {
	Axis,
	Chart,
	ChartClipPath,
	ChartGroup,
	Circle,
	Layer,
	Points,
	defaultChartPadding
} from 'layerchart';

import { cls } from '@layerstack/tailwind';

export default function Minimap($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = range(200).map((d) => ({ x: d, y: Math.random() }));

		{
			function children($$renderer, { group }) {
				const viewport = group.brush.active ? group.brush : group.domain;
				const viewportX = viewport.x ?? [null, null];
				const viewportY = viewport.y ?? [null, null];

				$$renderer.push(`<div class="relative">`);

				Chart($$renderer, {
					data,
					x: 'x',
					y: 'y',
					yNice: true,
					brush: { axis: 'both', zoomOnBrush: true },
					padding: defaultChartPadding({ left: 20, bottom: 24 }),
					height: 400,
					children: ($$renderer) => {
						Layer($$renderer, {
							children: ($$renderer) => {
								Axis($$renderer, { placement: 'left', grid: true, rule: true });
								$$renderer.push(`<!----> `);
								Axis($$renderer, { placement: 'bottom', rule: true });
								$$renderer.push(`<!----> `);

								ChartClipPath($$renderer, {
									children: ($$renderer) => {
										Points($$renderer, { class: 'fill-primary/30 stroke-primary', r: 4 });
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div class="absolute top-1 right-1 w-[25%] h-[25%] border rounded-sm bg-surface-100">`);

				{
					function children($$renderer, { context }) {
						Layer($$renderer, {
							children: ($$renderer) => {
								{
									function children($$renderer, { points }) {
										$$renderer.push(`<!--[-->`);

										const each_array = $.ensure_array_like(points);

										for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
											let point = each_array[$$index];
											const isSelected = context.brush.contains(point.data);

											Circle($$renderer, {
												cx: point.x,
												cy: point.y,
												r: 0.5,
												class: cls(isSelected
													? 'fill-primary/30 stroke-primary'
													: 'fill-surface-content/10 stroke-neutral'),
												motion: 'spring'
											});
										}

										$$renderer.push(`<!--]-->`);
									}

									Points($$renderer, { children, $$slots: { default: true } });
								}
							},
							$$slots: { default: true }
						});
					}

					Chart($$renderer, {
						data,
						x: 'x',
						y: 'y',
						yNice: true,
						brush: { axis: 'both', x: viewportX, y: viewportY },
						groupOptions: { publish: ['domain'], subscribe: ['pointer'] },
						children,
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!----></div></div>`);
			}

			ChartGroup($$renderer, {
				domain: { axis: 'both' },
				children,
				$$slots: { default: true }
			});
		}

		$.bind_props($$props, { data });
	});
}