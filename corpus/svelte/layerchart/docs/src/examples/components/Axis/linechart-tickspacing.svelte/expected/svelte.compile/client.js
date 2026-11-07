import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LineChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';
import { Switch } from 'svelte-ux';

var root = $.from_html(`<label class="flex gap-2 pb-4 screenshot-hidden"><!> </label> <!>`, 1);

export default function Linechart_tickspacing($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
	let tickSpacing = $.state(true);
	var $$exports = { data };
	var fragment = root();
	var label = $.first_child(fragment);
	var node = $.child(label);

	Switch(node, {
		get checked() {
			return $.get(tickSpacing);
		},

		set checked($$value) {
			$.set(tickSpacing, $$value, true);
		}
	});

	var text = $.sibling(node);

	$.reset(label);

	var node_1 = $.sibling(label, 2);

	{
		let $0 = $.derived(() => ({ xAxis: { tickSpacing: $.get(tickSpacing) ? 200 : undefined } }));

		LineChart(node_1, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			get props() {
				return $.get($0);
			},
			height: 300
		});
	}

	$.template_effect(() => $.set_text(text, ` ${$.get(tickSpacing) ? 'Applying tickSpacing' : 'Not applying tickSpacing'}`));
	$.append($$anchor, fragment);

	return $.pop($$exports);
}