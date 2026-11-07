import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PieChart } from 'layerchart';
import { longData } from '$lib/utils/data';
import { quantize } from 'd3-interpolate';
import { interpolateRainbow } from 'd3-scale-chromatic';

export default function Colors_interpolator($$anchor, $$props) {
	$.push($$props, true);

	const data = longData.filter((d) => d.year === 2019);
	var $$exports = { data };

	{
		let $0 = $.derived(() => quantize(interpolateRainbow, 5));

		PieChart($$anchor, {
			get data() {
				return data;
			},
			key: 'fruit',
			value: 'value',
			height: 300,
			get cRange() {
				return $.get($0);
			}
		});
	}

	return $.pop($$exports);
}