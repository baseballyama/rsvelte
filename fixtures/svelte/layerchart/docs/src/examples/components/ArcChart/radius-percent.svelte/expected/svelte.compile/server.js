import * as $ from 'svelte/internal/server';
import { ArcChart } from 'layerchart';

export default function Radius_percent($$renderer, $$props) {
	const data = [{ key: 'Example', value: 70 }];

	ArcChart($$renderer, {
		data,
		key: 'key',
		value: 'value',
		maxValue: 100,
		innerRadius: 0.8,
		trackOuterRadius: 0.95,
		trackInnerRadius: 0.9,
		cornerRadius: 10,
		height: 160
	});

	$.bind_props($$props, { data });
}