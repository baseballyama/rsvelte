import * as $ from 'svelte/internal/server';
import { BarChart, LinearGradient, Bars } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Gradient($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({
			count: 10,
			min: 20,
			max: 100,
			value: 'integer',
			keys: ['value', 'baseline']
		});

		{
			function marks($$renderer, { context }) {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(context.series.visibleSeries);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let s = each_array[$$index];

					{
						function children($$renderer, { gradient }) {
							Bars($$renderer, { fill: gradient, radius: 4, rounded: 'top' });
						}

						LinearGradient($$renderer, {
							class: 'from-blue-500 to-green-400',
							vertical: true,
							units: 'userSpaceOnUse',
							children,
							$$slots: { default: true }
						});
					}
				}

				$$renderer.push(`<!--]-->`);
			}

			BarChart($$renderer, {
				data,
				x: 'date',
				y: 'value',
				height: 300,
				marks,
				$$slots: { marks: true }
			});
		}

		$.bind_props($$props, { data });
	});
}