import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PieChart } from 'layerchart';
import { fruitColors } from '$lib/utils/fruits';
import ShowControl from '$lib/components/controls/fields/ShowField.svelte';
import { longData } from '$lib/utils/data';

var root = $.from_html(`<!> <div><!></div>`, 1);

export default function Motion_tween($$anchor, $$props) {
	$.push($$props, true);

	const data = longData.filter((d) => d.year === 2019);
	let show = $.state(void 0);
	var $$exports = { data };
	var fragment = root();
	var node = $.first_child(fragment);

	ShowControl(node, {
		label: 'Show Pie',
		get show() {
			return $.get(show);
		},

		set show($$value) {
			$.set(show, $$value, true);
		}
	});

	var div = $.sibling(node, 2);

	$.set_style(div, '', {}, { height: '300px' });

	var node_1 = $.child(div);

	{
		var consequent = ($$anchor) => {
			PieChart($$anchor, {
				get data() {
					return data;
				},
				key: 'fruit',
				value: 'value',
				get cRange() {
					return fruitColors;
				},
				props: { pie: { motion: 'tween' } },
				height: 300
			});
		};

		$.if(node_1, ($$render) => {
			if ($.get(show)) $$render(consequent);
		});
	}

	$.reset(div);
	$.append($$anchor, fragment);

	return $.pop($$exports);
}