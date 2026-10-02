import * as $ from 'svelte/internal/server';
import { Labels, LineChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Series_labels_hover($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({
			count: 30,
			min: 10,
			max: 100,
			value: 'integer',
			keys: ['apples', 'bananas', 'oranges']
		});

		{
			function aboveMarks($$renderer, { context }) {
				if (context.series.highlightKey) {
					$$renderer.push('<!--[0-->');
					Labels($$renderer, { seriesKey: context.series.highlightKey, offset: 10 });
				} else {
					$$renderer.push('<!--[-1-->');
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
				padding: 20,
				height: 300,
				aboveMarks,
				$$slots: { aboveMarks: true }
			});
		}

		$.bind_props($$props, { data });
	});
}