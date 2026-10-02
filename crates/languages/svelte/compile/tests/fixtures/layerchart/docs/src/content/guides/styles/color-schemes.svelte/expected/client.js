import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PieChart } from 'layerchart';
import { longData } from '$lib/utils/data';

import {
	schemeAccent,
	schemeCategory10,
	schemeDark2,
	schemePaired,
	schemePastel1,
	schemePastel2,
	schemeSet1,
	schemeSet2,
	schemeSet3,
	schemeTableau10
} from 'd3-scale-chromatic';

var root = $.from_html(`<option> </option>`);
var root_1 = $.from_html(`<select class="w-50 p-2 border rounded"></select> <!>`, 1);

export default function Color_schemes($$anchor, $$props) {
	$.push($$props, true);

	const schemes = [
		{ label: 'Tableau10', value: schemeTableau10 },
		{ label: 'Accent', value: schemeAccent },
		{ label: 'Category10', value: schemeCategory10 },
		{ label: 'Dark2', value: schemeDark2 },
		{ label: 'Paired', value: schemePaired },
		{ label: 'Pastel1', value: schemePastel1 },
		{ label: 'Pastel2', value: schemePastel2 },
		{ label: 'Set1', value: schemeSet1 },
		{ label: 'Set2', value: schemeSet2 },
		{ label: 'Set3', value: schemeSet3 }
	];

	const data = longData.filter((d) => d.year === 2019);
	let selectedScheme = $.state(undefined);
	var fragment = root_1();
	var select = $.first_child(fragment);

	$.each(select, 21, () => schemes, $.index, ($$anchor, scheme) => {
		var option = root();
		var text = $.only_child(option, true);
		var option_value = {};

		$.template_effect(() => {
			$.set_text(text, $.get(scheme).label);

			if (option_value !== (option_value = $.get(scheme).value)) {
				option.value = (option.__value = option_value) ?? '';
			}
		});

		$.append($$anchor, option);
	});

	$.reset(select);
	$.init_select(select);

	var node = $.sibling(select, 2);

	PieChart(node, {
		get data() {
			return data;
		},
		key: 'fruit',
		value: 'value',
		height: 300,
		get cRange() {
			return $.get(selectedScheme);
		}
	});

	$.bind_select_value(select, () => $.get(selectedScheme), ($$value) => $.set(selectedScheme, $$value));
	$.append($$anchor, fragment);
	$.pop();
}