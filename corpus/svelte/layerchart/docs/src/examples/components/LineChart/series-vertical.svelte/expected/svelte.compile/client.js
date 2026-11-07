import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LineChart, defaultChartPadding } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<div class="flex justify-center"><!></div>`);

export default function Series_vertical($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({
		count: 30,
		min: 10,
		max: 100,
		value: 'integer',
		keys: ['apples', 'bananas', 'oranges']
	});

	var $$exports = { data };
	var div = root();
	var node = $.child(div);

	{
		let $0 = $.derived(() => defaultChartPadding({ bottom: 25, left: 25 }));

		LineChart(node, {
			get data() {
				return data;
			},
			y: 'date',
			series: [
				{ key: 'apples', color: 'var(--color-apples)' },
				{ key: 'bananas', color: 'var(--color-bananas)' },
				{ key: 'oranges', color: 'var(--color-oranges)' }
			],
			orientation: 'vertical',
			get padding() {
				return $.get($0);
			},
			height: 600,
			width: 400
		});
	}

	$.reset(div);
	$.append($$anchor, div);

	return $.pop($$exports);
}