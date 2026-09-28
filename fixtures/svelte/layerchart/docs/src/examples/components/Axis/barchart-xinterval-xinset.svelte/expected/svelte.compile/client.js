import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart } from 'layerchart';
import { timeDay } from 'd3-time';
import { createDateSeries } from '$lib/utils/data.js';
import { Switch } from 'svelte-ux';

var root = $.from_html(`<div class="flex justify-between pb-4 screenshot-hidden"><label class="flex gap-2"><!> </label> <label class="flex gap-2"><!> </label></div> <!>`, 1);

export default function Barchart_xinterval_xinset($$anchor, $$props) {
	$.push($$props, true);

	const data = $.derived(() => createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' }));
	let xInterval = $.state(true);
	let xInset = $.state(true);

	var $$exports = {
		get data() {
			return $.get(data);
		}
	};

	var fragment = root();
	var div = $.first_child(fragment);
	var label = $.child(div);
	var node = $.child(label);

	Switch(node, {
		get checked() {
			return $.get(xInterval);
		},

		set checked($$value) {
			$.set(xInterval, $$value, true);
		}
	});

	var text = $.sibling(node);

	$.reset(label);

	var label_1 = $.sibling(label, 2);
	var node_1 = $.child(label_1);

	Switch(node_1, {
		get checked() {
			return $.get(xInset);
		},

		set checked($$value) {
			$.set(xInset, $$value, true);
		}
	});

	var text_1 = $.sibling(node_1);

	$.reset(label_1);
	$.reset(div);

	var node_2 = $.sibling(div, 2);

	{
		let $0 = $.derived(() => ({
			xAxis: { tickSpacing: 200 },
			bars: { insets: { x: $.get(xInset) ? 4 : undefined } }
		}));

		let $1 = $.derived(() => $.get(xInterval) ? timeDay : undefined);

		BarChart(node_2, {
			get data() {
				return $.get(data);
			},
			x: 'date',
			y: 'value',
			get props() {
				return $.get($0);
			},

			get xInterval() {
				return $.get($1);
			},
			height: 300
		});
	}

	$.template_effect(() => {
		$.set_text(text, ` ${$.get(xInterval)
			? 'Applying xInterval={timeDay}'
			: 'Not applying xInterval={timeDay}'}`);

		$.set_text(text_1, ` ${$.get(xInset) ? 'Applying xInset' : 'Not applying xInset'}`);
	});

	$.append($$anchor, fragment);

	return $.pop($$exports);
}