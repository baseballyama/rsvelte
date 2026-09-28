import * as $ from 'svelte/internal/server';
import { ArcChart } from 'layerchart';

export default function Color($$renderer, $$props) {
	const data = [{ key: 'Example', value: 70, color: 'var(--color-success)' }];

	ArcChart($$renderer, {
		data,
		key: 'key',
		value: 'value',
		maxValue: 100,
		range: [-90, 90],
		outerRadius: 80,
		innerRadius: -20,
		cornerRadius: 10,
		props: { group: { y: 40 } },
		height: 120
	});

	$.bind_props($$props, { data });
}