import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart, defaultChartPadding } from 'layerchart';
import { schemeCategory10 } from 'd3-scale-chromatic';

export default function Word_wrap_axis_labels($$anchor, $$props) {
	$.push($$props, true);

	const data = [
		{ value: 67, label: 'This is\n1st really\nlong text' },
		{ value: 97, label: 'This is\n2nd really\nlong text' },
		{ value: 61, label: 'This is\n3rd really\nlong text' }
	];

	var $$exports = { data };

	{
		let $0 = $.derived(() => defaultChartPadding({ top: 20, left: 60 }));

		BarChart($$anchor, {
			get data() {
				return data;
			},
			x: 'value',
			y: 'label',
			labels: { placement: 'inside' },
			get cRange() {
				return schemeCategory10;
			},
			orientation: 'horizontal',
			get padding() {
				return $.get($0);
			},
			height: 300
		});
	}

	return $.pop($$exports);
}