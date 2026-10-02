import * as $ from 'svelte/internal/server';
import { LineChart, Spline, defaultChartPadding } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';
import { cls } from '@layerstack/tailwind';

export default function Series_with_nulls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const keys = ['apples', 'bananas', 'oranges'];

		const data = createDateSeries({ count: 30, min: 10, max: 100, value: 'integer', keys }).map((d) => {
			const newItem = { ...d };

			keys.forEach((key) => {
				// @ts-expect-error shh
				newItem[key] = Math.random() < 0.2 ? null : newItem[key];
			});

			return newItem;
		});

		{
			function belowMarks($$renderer, { context }) {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(context.series.visibleSeries);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let s = each_array[$$index];

					Spline($$renderer, {
						data: data.filter((d) => d[s.key] !== null),
						y: s.key,
						stroke: s.color,
						class: cls('[stroke-dasharray:3,3] transition-opacity', context.series.highlightKey && context.series.highlightKey !== s.key && 'opacity-10')
					});
				}

				$$renderer.push(`<!--]-->`);
			}

			LineChart($$renderer, {
				data,
				x: 'date',
				series: [
					{ key: 'apples', color: 'var(--color-apples)' },
					{ key: 'bananas', color: 'var(--color-bananas)' },
					{ key: 'oranges', color: 'var(--color-oranges)' }
				],
				height: 300,
				padding: defaultChartPadding({ right: 10 }),
				belowMarks,
				$$slots: { belowMarks: true }
			});
		}

		$.bind_props($$props, { data });
	});
}