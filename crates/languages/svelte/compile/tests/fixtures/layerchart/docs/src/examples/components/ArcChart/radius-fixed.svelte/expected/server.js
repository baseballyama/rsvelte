import * as $ from 'svelte/internal/server';
import { ArcChart } from 'layerchart';

export default function Radius_fixed($$renderer, $$props) {
	const data = [{ key: 'Example', value: 70 }];

	ArcChart($$renderer, {
		data,
		key: 'key',
		value: 'value',
		maxValue: 100,
		outerRadius: 80,
		innerRadius: 60,
		trackOuterRadius: 75,
		trackInnerRadius: 65,
		cornerRadius: 10,
		height: 160
	});

	$.bind_props($$props, { data });
}