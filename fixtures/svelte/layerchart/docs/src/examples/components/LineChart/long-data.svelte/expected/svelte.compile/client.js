import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LineChart } from 'layerchart';
import { scalePoint } from 'd3-scale';
import { sort } from '@layerstack/utils';
import { longData } from '$lib/utils/data.js';

export default function Long_data($$anchor, $$props) {
	$.push($$props, true);

	// A point scale takes the domain in data order, so the years have to arrive in it
	const data = sort(longData, 'year');

	var $$exports = { data };

	{
		let $0 = $.derived(scalePoint);

		LineChart($$anchor, {
			get data() {
				return data;
			},
			x: 'year',
			get xScale() {
				return $.get($0);
			},
			y: 'value',
			c: 'fruit',
			legend: true,
			cRange: [
				'var(--color-apples)',
				'var(--color-bananas)',
				'var(--color-cherries)',
				'var(--color-grapes)'
			],
			props: { xAxis: { format: 'none' }, yAxis: { format: 'metric' } },
			height: 300
		});
	}

	return $.pop($$exports);
}