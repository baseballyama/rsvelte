import * as $ from 'svelte/internal/server';
import { Area, Axis, Chart, Layer, LinearGradient, Rule } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Threshold_with_lineargradient_over_under($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ count: 30, min: -20, max: 50, value: 'integer' });

		{
			function children($$renderer, { context }) {
				const thresholdValue = 0;
				const thresholdOffset = context.yScale(thresholdValue) / context.containerHeight;

				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'left', grid: true, rule: true });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'bottom' });
						$$renderer.push(`<!----> `);
						Rule($$renderer, { y: 0 });
						$$renderer.push(`<!----> `);

						{
							function children($$renderer, { gradient }) {
								Area($$renderer, {
									y0: (d) => 0,
									line: { stroke: gradient, class: 'stroke-2' },
									fill: gradient,
									fillOpacity: 0.2
								});
							}

							LinearGradient($$renderer, {
								stops: [
									[thresholdOffset, 'var(--color-success)'],
									[thresholdOffset, 'var(--color-danger)']
								],
								units: 'userSpaceOnUse',
								vertical: true,
								children,
								$$slots: { default: true }
							});
						}

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