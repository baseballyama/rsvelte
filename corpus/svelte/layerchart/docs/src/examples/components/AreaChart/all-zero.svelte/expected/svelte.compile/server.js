import * as $ from 'svelte/internal/server';
import { AreaChart } from 'layerchart';

export default function All_zero($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = Array.from({ length: 30 }, (_, i) => ({ date: new Date(2025, 7, 17 + i), value: 0 }));

		AreaChart($$renderer, { data, x: 'date', y: 'value', height: 300 });
		$.bind_props($$props, { data });
	});
}