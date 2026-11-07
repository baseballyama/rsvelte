import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart } from 'layerchart';
import { MenuField } from 'svelte-ux';
import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<!> <!>`, 1);

export default function Labels_placement($$anchor, $$props) {
	$.push($$props, true);

	const placements = [
		{ label: 'Inside', value: 'inside' },
		{ label: 'Outside', value: 'outside' },
		{ label: 'Middle', value: 'middle' },
		{ label: 'Center', value: 'center' }
	];

	let placement = $.state('outside');

	const data = createDateSeries({
		count: 10,
		min: -20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});

	var $$exports = { data };
	var fragment = root();
	var node = $.first_child(fragment);

	MenuField(node, {
		label: 'Placement',
		get options() {
			return placements;
		},
		stepper: true,
		classes: { root: 'mb-4', menuIcon: 'hidden' },
		get value() {
			return $.get(placement);
		},

		set value($$value) {
			$.set(placement, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => ({ placement: $.get(placement) }));

		BarChart(node_1, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			get labels() {
				return $.get($0);
			},
			yPadding: [20, 20],
			height: 300
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}