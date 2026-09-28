import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LineChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<div class="flex justify-center"><!></div>`);

export default function Vertical($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
	var $$exports = { data };
	var div = root();
	var node = $.child(div);

	LineChart(node, {
		get data() {
			return data;
		},
		x: 'value',
		y: 'date',
		orientation: 'vertical',
		width: 400,
		height: 600
	});

	$.reset(div);
	$.append($$anchor, div);

	return $.pop($$exports);
}