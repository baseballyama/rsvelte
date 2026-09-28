import * as $ from 'svelte/internal/server';
import { range } from 'd3-array';
import { Axis, Chart, Circle, Layer, Points, defaultChartPadding } from 'layerchart';
import { cls } from '@layerstack/tailwind';

export default function Selection($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = range(200).map((d) => {
			return { x: d, y: Math.random() };
		});

		{
			function children($$renderer, { context }) {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'left', grid: true, rule: true });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'bottom', rule: true });
						$$renderer.push(`<!----> `);

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
										r: isSelected ? 4 : 2,
										class: cls(isSelected
											? 'fill-primary/30 stroke-primary'
											: 'fill-neutral/10 stroke-neutral'),
										motion: 'spring'
									});
								}

								$$renderer.push(`<!--]-->`);
							}

							Points($$renderer, { children, $$slots: { default: true } });
						}

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			}

			Chart($$renderer, {
				data,
				x: 'x',
				y: 'y',
				yDomain: [0, null],
				yNice: true,
				padding: defaultChartPadding({ top: 20, left: 20, bottom: 24 }),
				brush: { axis: 'both' },
				height: 400,
				children,
				$$slots: { default: true }
			});
		}

		$.bind_props($$props, { data });
	});
}