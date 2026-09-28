import * as $ from 'svelte/internal/server';
import { ArcChart } from 'layerchart';

export default function Radius_offset($$renderer, $$props) {
	const data = [{ key: 'Example', value: 70 }];

	ArcChart($$renderer, {
		data,
		key: 'key',
		value: 'value',
		maxValue: 100,
		innerRadius: -20,
		trackOuterRadius: -5,
		trackInnerRadius: -10,
		cornerRadius: 10,
		height: 160
	});

	$.bind_props($$props, { data });
}