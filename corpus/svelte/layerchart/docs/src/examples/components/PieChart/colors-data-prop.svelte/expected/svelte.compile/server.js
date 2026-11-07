import * as $ from 'svelte/internal/server';
import { PieChart } from 'layerchart';
import { longData } from '$lib/utils/data';

export default function Colors_data_prop($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = longData.filter((d) => d.year === 2019).map((d, i) => {
			return {
				...d,
				color: [
					'var(--color-apples)',
					'var(--color-bananas)',
					'var(--color-cherries)',
					'var(--color-grapes)'
				][i]
			};
		});

		PieChart($$renderer, { data, key: 'fruit', value: 'value', c: 'color', height: 300 });
		$.bind_props($$props, { data });
	});
}