import * as $ from 'svelte/internal/server';
import { range } from 'd3-array';

import {
	Axis,
	Brush,
	Chart,
	Circle,
	Layer,
	Points,
	defaultChartPadding
} from 'layerchart';

import { cls } from '@layerstack/tailwind';

export default function Two_dimensional($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = range(200).map((d) => ({ x: d, y: Math.random() }));
		let brush = void 0;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="text-sm text-surface-content/70 mb-2 h-5">`);

			if (brush?.active) {
				$$renderer.push(`<!--[0-->${$.escape(data.filter((d) => brush.contains(d)).length)} of ${$.escape(data.length)} points selected`);
			} else {
				$$renderer.push(`<!--[-1-->Drag to select points`);
			}

			$$renderer.push(`<!--]--></div> `);

			Chart($$renderer, {
				data,
				x: 'x',
				y: 'y',
				yDomain: [0, null],
				yNice: true,
				padding: defaultChartPadding({ top: 20, left: 20, bottom: 24 }),
				height: 400,
				children: ($$renderer) => {
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
										const isSelected = brush?.contains(point.data) ?? false;

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

							$$renderer.push(`<!----> `);

							Brush($$renderer, {
								axis: 'both',
								get state() {
									return brush;
								},

								set state($$value) {
									brush = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { data });
	});
}