import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<div class="h-[300px] p-4 border rounded-sm"><!></div>`);

export default function Point_annotation($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({
		count: 10,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});

	var $$exports = { data };
	var div = root();
	var node = $.child(div);

	{
		let $0 = $.derived(() => [
			{
				type: 'point',
				x: data[data.length - 1].date,
				r: 4,
				label: 'Today',
				labelPlacement: 'bottom',
				labelYOffset: 16,
				props: {
					circle: { class: 'fill-secondary' },
					label: { class: 'text-xs fill-secondary font-bold' }
				}
			}
		]);

		BarChart(node, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			get annotations() {
				return $.get($0);
			},
			height: 300
		});
	}

	$.reset(div);
	$.append($$anchor, div);

	return $.pop($$exports);
}