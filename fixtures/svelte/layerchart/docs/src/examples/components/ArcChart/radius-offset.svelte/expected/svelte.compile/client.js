import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ArcChart } from 'layerchart';

export default function Radius_offset($$anchor, $$props) {
	$.push($$props, true);

	const data = [{ key: 'Example', value: 70 }];
	var $$exports = { data };

	ArcChart($$anchor, {
		get data() {
			return data;
		},
		key: 'key',
		value: 'value',
		maxValue: 100,
		innerRadius: -20,
		trackOuterRadius: -5,
		trackInnerRadius: -10,
		cornerRadius: 10,
		height: 160
	});

	return $.pop($$exports);
}