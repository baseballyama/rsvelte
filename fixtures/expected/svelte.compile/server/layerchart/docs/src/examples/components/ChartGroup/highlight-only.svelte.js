import * as $ from 'svelte/internal/server';
import { ChartGroup, LineChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Highlight_only($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const panels = [
			{
				key: 'requests',
				label: 'Requests',
				data: createDateSeries({ count: 40, min: 400, max: 900, value: 'integer' }),
				color: 'var(--color-info-500)'
			},

			{
				key: 'latency',
				label: 'Latency (ms)',
				data: createDateSeries({ count: 40, min: 20, max: 180, value: 'integer' }),
				color: 'var(--color-warning-500)'
			},

			{
				key: 'errors',
				label: 'Errors',
				data: createDateSeries({ count: 40, min: 0, max: 30, value: 'integer' }),
				color: 'var(--color-danger-500)'
			}
		];

		const data = panels;

		{
			function children($$renderer, { group }) {
				$$renderer.push(`<div class="grid gap-2"><!--[-->`);

				const each_array = $.ensure_array_like(panels);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let panel = each_array[$$index];
					const isChartActive = group.pointer.source === panel.key;

					$$renderer.push(`<div class="border rounded-sm p-2"><div class="text-sm text-surface-content/70">${$.escape(panel.label)}</div> `);

					LineChart($$renderer, {
						id: panel.key,
						data: panel.data,
						x: 'date',
						y: 'value',
						series: [{ key: 'value', label: panel.label, color: panel.color }],
						highlight: { lines: true, points: isChartActive },
						height: 100,
						padding: { left: 40, bottom: 20 }
					});

					$$renderer.push(`<!----></div>`);
				}

				$$renderer.push(`<!--]--></div>`);
			}

			ChartGroup($$renderer, {
				pointer: { tooltip: false },
				children,
				$$slots: { default: true }
			});
		}

		$.bind_props($$props, { data });
	});
}