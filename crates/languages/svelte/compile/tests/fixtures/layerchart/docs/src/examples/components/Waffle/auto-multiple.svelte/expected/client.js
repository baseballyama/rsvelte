import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Waffle } from 'layerchart';
import { RangeField } from 'svelte-ux';

var root = $.from_html(`<div class="mb-4 screenshot-hidden"><!></div> <!>`, 1);

export default function Auto_multiple($$anchor) {
	let apples = $.state(500);
	const data = $.derived(() => [{ label: 'apples', count: $.get(apples) }]);
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	RangeField(node, {
		label: 'Apples',
		min: 10,
		max: 1000,
		dense: true,
		get value() {
			return $.get(apples);
		},

		set value($$value) {
			$.set(apples, $$value, true);
		}
	});

	$.reset(div);

	var node_1 = $.sibling(div, 2);

	{
		const marks = ($$anchor) => {
			Waffle($$anchor, { axis: 'x', fill: 'var(--color-primary)' });
		};

		Chart(node_1, {
			get data() {
				return $.get(data);
			},
			x: 'count',
			xDomain: [0, null],
			xNice: true,
			y: 'label',
			padding: { left: 48, bottom: 24, right: 8 },
			height: 180,
			marks,
			$$slots: { marks: true }
		});
	}

	$.append($$anchor, fragment);
}