import * as $ from 'svelte/internal/server';
import { Area, Axis, Chart, Layer, RectClipPath, Rule } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Threshold_with_rectclippath($$renderer, $$props) {
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
									line: { class: 'stroke-2 stroke-danger' },
									class: 'fill-danger/20'
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
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