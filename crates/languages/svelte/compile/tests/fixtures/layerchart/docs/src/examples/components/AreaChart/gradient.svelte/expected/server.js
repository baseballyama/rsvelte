import * as $ from 'svelte/internal/server';
import { Area, AreaChart, defaultChartPadding, LinearGradient } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Gradient($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });

		{
			function marks($$renderer) {
				{
					function children($$renderer, { gradient }) {
						Area($$renderer, { line: { class: 'stroke-primary' }, fill: gradient });
					}

					LinearGradient($$renderer, {
						class: 'from-primary/50 to-primary/1',
						vertical: true,
						children,
						$$slots: { default: true }
					});
				}
			}

			AreaChart($$renderer, {
				data,
				x: 'date',
				y: 'value',
				padding: defaultChartPadding({ right: 10 }),
				height: 300,
				marks,
				$$slots: { marks: true }
			});
		}

		$.bind_props($$props, { data });
	});
}