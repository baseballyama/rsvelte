import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart, defaultChartPadding } from 'layerchart';
import TextTruncateControls from '$lib/components/controls/TextTruncateControls.svelte';
import { schemeTableau10 } from 'd3-scale-chromatic';

var root = $.from_html(`<!> <!>`, 1);

export default function Truncate_axis_labels($$anchor, $$props) {
	$.push($$props, true);

	const data = [
		{ value: 47, label: 'This is 1st really long text' },
		{ value: 27, label: 'This is 2nd really long text' },
		{ value: 82, label: 'This is 3rd really long text' }
	];

	let position = $.state('end');
	var $$exports = { data };
	var fragment = root();
	var node = $.first_child(fragment);

	TextTruncateControls(node, {
		get position() {
			return $.get(position);
		},

		set position($$value) {
			$.set(position, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => ({
			yAxis: {
				tickLabelProps: {
					truncate: { maxChars: 19, ellipsis: '...', position: $.get(position) }
				}
			}
		}));

		let $1 = $.derived(() => defaultChartPadding({ top: 20, left: 90 }));

		BarChart(node_1, {
			get data() {
				return data;
			},
			x: 'value',
			y: 'label',
			labels: { placement: 'inside' },
			get cRange() {
				return schemeTableau10;
			},
			orientation: 'horizontal',
			get props() {
				return $.get($0);
			},

			get padding() {
				return $.get($1);
			},
			height: 300
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}