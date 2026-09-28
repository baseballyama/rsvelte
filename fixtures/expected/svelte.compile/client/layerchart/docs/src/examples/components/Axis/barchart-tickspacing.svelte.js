import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart } from 'layerchart';
import { getRandomInteger } from '$lib/utils/data.js';
import { Switch } from 'svelte-ux';

var root = $.from_html(`<label class="flex gap-2 pb-4 screenshot-hidden"><!> </label> <!>`, 1);

export default function Barchart_tickspacing($$anchor, $$props) {
	$.push($$props, true);

	const states = [
		'AL',
		'AK',
		'AZ',
		'AR',
		'CA',
		'CO',
		'CT',
		'DE',
		'FL',
		'GA',
		'HI',
		'ID',
		'IL',
		'IN',
		'IA',
		'KS',
		'KY',
		'LA',
		'ME',
		'MD',
		'MA',
		'MI',
		'MN',
		'MS',
		'MO',
		'MT',
		'NE',
		'NV',
		'NH',
		'NJ',
		'NM',
		'NY',
		'NC',
		'ND',
		'OH',
		'OK',
		'OR',
		'PA',
		'RI',
		'SC',
		'SD',
		'TN',
		'TX',
		'UT',
		'VT',
		'VA',
		'WA',
		'WV',
		'WI',
		'WY'
	];

	const data = states.map((state) => ({ state, value: getRandomInteger(20, 100) }));
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
		let $0 = $.derived(() => ({ xAxis: { tickSpacing: $.get(tickSpacing) ? 80 : null } }));

		BarChart(node_1, {
			get data() {
				return data;
			},
			x: 'state',
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