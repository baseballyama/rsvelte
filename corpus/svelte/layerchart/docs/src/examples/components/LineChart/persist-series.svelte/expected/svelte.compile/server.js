import * as $ from 'svelte/internal/server';
import { LineChart, defaultChartPadding } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Persist_series($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const STORAGE_KEY = 'layerchart:persist-series:selected-keys';

		const data = createDateSeries({
			count: 30,
			min: 10,
			max: 100,
			value: 'integer',
			keys: ['apples', 'bananas', 'oranges']
		});

		let context = void 0;
		let loaded = false;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="text-center pb-4 text-sm">Select desired series on the legend, reload the page, and they will persist.</div> `);

			LineChart($$renderer, {
				data,
				x: 'date',
				series: [
					{ key: 'apples', color: 'var(--color-apples)' },
					{ key: 'bananas', color: 'var(--color-bananas)' },
					{ key: 'oranges', color: 'var(--color-oranges)' }
				],
				padding: defaultChartPadding({ legend: true, right: 10 }),
				height: 300,
				legend: true,
				get context() {
					return context;
				},

				set context($$value) {
					context = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { data });
	});
}