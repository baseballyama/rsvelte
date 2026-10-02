import * as $ from 'svelte/internal/server';
import { Area, AreaChart, defaultChartPadding, LinearGradient } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Series_stack_gradient($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({
			count: 30,
			min: 10,
			max: 100,
			value: 'integer',
			keys: ['apples', 'bananas', 'oranges']
		});

		{
			function marks($$renderer, { context }) {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(context.series.series);

				for (let i = 0, $$length = each_array.length; i < $$length; i++) {
					let s = each_array[i];

					{
						function children($$renderer, { gradient }) {
							Area($$renderer, {
								seriesKey: s.key,
								line: { stroke: s.color },
								fill: gradient,
								fillOpacity: 0.3
							});
						}

						LinearGradient($$renderer, {
							stops: s.color
								? [
									s.color,
									'color-mix(in lch, ' + s.color + ' 10%, transparent)'
								]
								: undefined,
							vertical: true,
							children,
							$$slots: { default: true }
						});
					}
				}

				$$renderer.push(`<!--]-->`);
			}

			AreaChart($$renderer, {
				data,
				x: 'date',
				series: [
					{ key: 'apples', color: 'var(--color-apples)' },
					{ key: 'bananas', color: 'var(--color-bananas)' },
					{ key: 'oranges', color: 'var(--color-oranges)' }
				],
				padding: defaultChartPadding({ right: 10 }),
				height: 300,
				marks,
				$$slots: { marks: true }
			});
		}

		$.bind_props($$props, { data });
	});
}