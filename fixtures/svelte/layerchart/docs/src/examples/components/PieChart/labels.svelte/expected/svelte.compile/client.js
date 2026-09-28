import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PieChart } from 'layerchart';
import { MenuField, RangeField } from 'svelte-ux';
import { longData } from '$lib/utils/data';
import { fruitColors } from '$lib/utils/fruits';

var root = $.from_html(`<div class="grid grid-cols-[1fr_1fr] gap-2 mb-4"><!> <!></div> <!>`, 1);

export default function Labels($$anchor, $$props) {
	$.push($$props, true);

	const placements = [
		{ label: 'Callout', value: 'callout' },
		{ label: 'Centroid', value: 'centroid' },
		{ label: 'Centroid (rotated)', value: 'centroid-rotated' },
		{ label: 'Centroid (radial)', value: 'centroid-radial' },
		{ label: 'Inner', value: 'inner' },
		{ label: 'Middle', value: 'middle' },
		{ label: 'Outer', value: 'outer' }
	];

	let placement = $.state('callout');
	let offset = $.state(0);
	const data = longData.filter((d) => d.year === 2019);
	var $$exports = { data };
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	MenuField(node, {
		label: 'Placement',
		get options() {
			return placements;
		},
		stepper: true,
		classes: { menuIcon: 'hidden' },
		get value() {
			return $.get(placement);
		},

		set value($$value) {
			$.set(placement, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	RangeField(node_1, {
		label: 'Offset',
		min: -40,
		max: 60,
		get value() {
			return $.get(offset);
		},

		set value($$value) {
			$.set(offset, $$value, true);
		}
	});

	$.reset(div);

	var node_2 = $.sibling(div, 2);

	{
		let $0 = $.derived(() => ({
			placement: $.get(placement),
			offset: $.get(offset),
			value: 'fruit',
			class: 'text-xs fill-surface-content'
		}));

		PieChart(node_2, {
			get data() {
				return data;
			},
			key: 'fruit',
			value: 'value',
			get cRange() {
				return fruitColors;
			},
			innerRadius: -40,
			padding: { top: 24, bottom: 24, left: 80, right: 80 },
			get labels() {
				return $.get($0);
			},
			height: 360
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}