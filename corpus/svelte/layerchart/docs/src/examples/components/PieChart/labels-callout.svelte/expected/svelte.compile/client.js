import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PieChart } from 'layerchart';
import { RangeField } from 'svelte-ux';
import { longData } from '$lib/utils/data';
import { fruitColors } from '$lib/utils/fruits';

var root = $.from_html(`<div class="grid grid-cols-3 gap-2 mb-4"><!> <!> <!></div> <!>`, 1);

export default function Labels_callout($$anchor, $$props) {
	$.push($$props, true);

	let calloutLineLength = $.state(16);
	let calloutLabelOffset = $.state(12);
	let calloutPadding = $.state(4);
	const data = longData.filter((d) => d.year === 2019);
	var $$exports = { data };
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	RangeField(node, {
		label: 'calloutLineLength',
		min: 0,
		max: 60,
		get value() {
			return $.get(calloutLineLength);
		},

		set value($$value) {
			$.set(calloutLineLength, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	RangeField(node_1, {
		label: 'calloutLabelOffset',
		min: 0,
		max: 60,
		get value() {
			return $.get(calloutLabelOffset);
		},

		set value($$value) {
			$.set(calloutLabelOffset, $$value, true);
		}
	});

	var node_2 = $.sibling(node_1, 2);

	RangeField(node_2, {
		label: 'calloutPadding',
		min: 0,
		max: 20,
		get value() {
			return $.get(calloutPadding);
		},

		set value($$value) {
			$.set(calloutPadding, $$value, true);
		}
	});

	$.reset(div);

	var node_3 = $.sibling(div, 2);

	{
		let $0 = $.derived(() => ({
			placement: 'callout',
			value: 'fruit',
			calloutLineLength: $.get(calloutLineLength),
			calloutLabelOffset: $.get(calloutLabelOffset),
			calloutPadding: $.get(calloutPadding),
			class: 'text-xs fill-surface-content',
			line: { class: 'opacity-50' }
		}));

		PieChart(node_3, {
			get data() {
				return data;
			},
			key: 'fruit',
			value: 'value',
			get cRange() {
				return fruitColors;
			},
			innerRadius: -40,
			padding: { top: 24, bottom: 24, left: 100, right: 100 },
			get labels() {
				return $.get($0);
			},
			height: 360
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}