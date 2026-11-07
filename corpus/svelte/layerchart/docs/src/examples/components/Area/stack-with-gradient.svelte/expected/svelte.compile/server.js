import * as $ from 'svelte/internal/server';

import {
	Area,
	Axis,
	Chart,
	Layer,
	LinearGradient,
	asAny,
	chartDataArray,
	defaultChartPadding
} from 'layerchart';

import { stack } from 'd3-shape';
import flatten from '$lib/utils/flatten.js';
import { createDateSeries } from '$lib/utils/data.js';

export default function Stack_with_gradient($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const keys = ['apples', 'bananas', 'oranges'];
		const multiSeriesData = createDateSeries({ count: 30, min: 10, max: 100, value: 'integer', keys });
		const stackData = stack().keys(keys)(multiSeriesData);

		Chart($$renderer, {
			data: stackData,
			flatData: flatten(stackData),
			x: (d) => asAny(d).data.date,
			y: [0, 1],
			yNice: true,
			padding: defaultChartPadding({ left: 25, bottom: 20 }),
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						const primaryColors = [
							'var(--color-apples)',
							'var(--color-bananas)',
							'var(--color-oranges)'
						];

						const secondaryColors = [
							'color-mix(in lch, var(--color-apples) 10%, transparent)',
							'color-mix(in lch, var(--color-bananas) 10%, transparent)',
							'color-mix(in lch, var(--color-oranges) 10%, transparent)'
						];

						Axis($$renderer, { placement: 'left', grid: true, rule: true });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'bottom', rule: true });
						$$renderer.push(`<!---->  <!--[-->`);

						const each_array = $.ensure_array_like(chartDataArray(stackData));

						for (let index = 0, $$length = each_array.length; index < $$length; index++) {
							let seriesData = each_array[index];
							const primaryColor = primaryColors[index];
							const secondaryColor = secondaryColors[index];

							{
								function children($$renderer, { gradient }) {
									Area($$renderer, {
										data: seriesData,
										fill: gradient,
										fillOpacity: 0.5,
										line: { stroke: primaryColor }
									});
								}

								LinearGradient($$renderer, {
									stops: [primaryColor, secondaryColor],
									vertical: true,
									children,
									$$slots: { default: true }
								});
							}
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$.bind_props($$props, { data: stackData });
	});
}