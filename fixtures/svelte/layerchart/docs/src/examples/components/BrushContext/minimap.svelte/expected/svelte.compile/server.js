import * as $ from 'svelte/internal/server';
import { range } from 'd3-array';

import {
	Axis,
	Chart,
	ChartClipPath,
	Circle,
	Layer,
	Points,
	defaultChartPadding
} from 'layerchart';

import { cls } from '@layerstack/tailwind';

export default function Minimap($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = range(200).map((d) => {
			return { x: d, y: Math.random() };
		});

		// Committed domain — drives main chart's visible range
		let xDomain = [null, null];

		let yDomain = [null, null];

		// Live brush position — updates during drag for minimap display
		let brushX = [null, null];

		let brushY = [null, null];

		$$renderer.push(`<div class="relative">`);

		Chart($$renderer, {
			data,
			x: 'x',
			xDomain,
			y: 'y',
			yDomain,
			yNice: true,
			brush: {
				axis: 'both',
				onChange: (e) => {
					brushX = e.brush.x;
					brushY = e.brush.y;
				},

				onBrushEnd: (e) => {
					xDomain = e.brush.x;
					yDomain = e.brush.y;
					brushX = e.brush.x;
					brushY = e.brush.y;
					e.brush.reset();
				}
			},
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
				brush: {
					axis: 'both',
					x: brushX,
					y: brushY,
					onChange: (e) => {
						xDomain = e.brush.x;
						yDomain = e.brush.y;
						brushX = e.brush.x;
						brushY = e.brush.y;
					}
				},
				children,
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!----></div></div>`);
		$.bind_props($$props, { data });
	});
}