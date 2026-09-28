import * as $ from 'svelte/internal/server';
import { AreaChart, Circle, defaultChartPadding, Layer, Line } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';
import { Button } from 'svelte-ux';
import { Blockquote } from '@layerstack/docs/markdown/components';

export default function Markers($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
		let markerPoints = [];

		{
			function aboveMarks($$renderer, { context }) {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(markerPoints);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let p = each_array[$$index];

					Line($$renderer, {
						x1: context.xScale(p.date),
						y1: context.height,
						x2: context.xScale(p.date),
						y2: context.yScale(p.value),
						stroke: 'var(--color-surface-content)',
						strokeOpacity: 0.5,
						strokeWidth: 2,
						dashArray: [4, 4]
					});

					$$renderer.push(`<!----> `);

					Circle($$renderer, {
						cx: context.xScale(p.date),
						cy: context.yScale(p.value),
						r: 4,
						class: 'fill-primary stroke-4 stroke-primary/50'
					});

					$$renderer.push(`<!---->`);
				}

				$$renderer.push(`<!--]-->`);
			}

			function aboveContext($$renderer, { context }) {
				Layer($$renderer, {
					type: 'html',
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array_1 = $.ensure_array_like(markerPoints);

						for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
							let p = each_array_1[$$index_1];

							Button($$renderer, {
								class: 'absolute translate-x-[-50%] text-[10px] bg-surface-100 border border-primary',
								style: `top: ${$.stringify(context.height + 2)}px; left: ${$.stringify(context.xScale(p.date))}px`,
								size: 'sm',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Remove`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});
			}

			AreaChart($$renderer, {
				data,
				x: 'date',
				y: 'value',
				onTooltipClick: (e, detail) => {
					if (markerPoints.includes(detail.data)) {
						markerPoints = markerPoints.filter((d) => d !== detail.data);
					} else {
						markerPoints = [...markerPoints, detail.data];
					}
				},
				padding: defaultChartPadding({ right: 10 }),
				height: 300,
				aboveMarks,
				aboveContext,
				$$slots: { aboveMarks: true, aboveContext: true }
			});
		}

		$$renderer.push(`<!----> `);

		Blockquote($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Click to add/remove markers`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
		$.bind_props($$props, { data });
	});
}