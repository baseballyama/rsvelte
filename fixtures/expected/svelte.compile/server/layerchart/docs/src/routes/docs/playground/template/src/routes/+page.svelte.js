import * as $ from 'svelte/internal/server';
import { LineChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });

		LineChart($$renderer, { data, x: 'date', y: 'value', height: 300 });
	});
}