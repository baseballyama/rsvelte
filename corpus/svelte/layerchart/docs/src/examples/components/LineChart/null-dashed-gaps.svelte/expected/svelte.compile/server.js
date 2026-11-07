import * as $ from 'svelte/internal/server';
import { LineChart, Spline, defaultChartPadding } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Null_dashed_gaps($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' }).map((d) => {
			return { ...d, value: Math.random() < 0.2 ? null : d.value };
		});

		{
			function belowMarks($$renderer, { series }) {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(series);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let s = each_array[$$index];

					Spline($$renderer, {
						data: data.filter((d) => d.value !== null),
						y: s.value,
						class: '[stroke-dasharray:3,3]',
						stroke: s.color
					});
				}

				$$renderer.push(`<!--]-->`);
			}

			LineChart($$renderer, {
				data,
				x: 'date',
				y: 'value',
				padding: defaultChartPadding({ right: 10 }),
				height: 300,
				belowMarks,
				$$slots: { belowMarks: true }
			});
		}

		$.bind_props($$props, { data });
	});
}