import * as $ from 'svelte/internal/server';

import {
	ArcChart,
	AreaChart,
	BarChart,
	LineChart,
	PieChart,
	ScatterChart
} from 'layerchart';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = [
			{ date: new Date('2025-01-01T00:00'), value: 30 },
			{ date: new Date('2025-02-01T00:00'), value: 50 },
			{ date: new Date('2025-03-01T00:00'), value: 40 },
			{ date: new Date('2025-04-01T00:00'), value: 70 },
			{ date: new Date('2025-05-01T00:00'), value: 60 },
			{ date: new Date('2025-06-01T00:00'), value: 90 }
		];

		const pieData = [
			{ fruit: 'Apples', value: 3840 },
			{ fruit: 'Bananas', value: 1920 },
			{ fruit: 'Cherries', value: 960 },
			{ fruit: 'Grapes', value: 400 }
		];

		$$renderer.push(`<main class="svelte-1nywjuk"><div class="chart svelte-1nywjuk">`);
		AreaChart($$renderer, { data, x: 'date', y: 'value' });
		$$renderer.push(`<!----></div> <div class="chart svelte-1nywjuk">`);
		LineChart($$renderer, { data, x: 'date', y: 'value' });
		$$renderer.push(`<!----></div> <div class="chart svelte-1nywjuk">`);
		BarChart($$renderer, { data, x: 'date', y: 'value' });
		$$renderer.push(`<!----></div> <div class="chart svelte-1nywjuk">`);
		ScatterChart($$renderer, { data, x: 'date', y: 'value' });
		$$renderer.push(`<!----></div> <div class="chart svelte-1nywjuk">`);
		PieChart($$renderer, { data: pieData, key: 'fruit', value: 'value' });
		$$renderer.push(`<!----></div> <div class="chart svelte-1nywjuk">`);

		ArcChart($$renderer, {
			data: [{ key: 'Example', value: 70 }],
			maxValue: 100,
			innerRadius: -20,
			cornerRadius: 10
		});

		$$renderer.push(`<!----></div></main>`);
	});
}