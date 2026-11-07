import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LineChart, defaultChartPadding } from 'layerchart';
import ShowControl from '$lib/components/controls/fields/ShowField.svelte';
import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<!> <div><!></div>`, 1);

export default function Motion_tween($$anchor, $$props) {
	$.push($$props, true);

	let show = $.state(void 0);
	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
	var $$exports = { data };
	var fragment = root();
	var node = $.first_child(fragment);

	ShowControl(node, {
		label: 'Show Chart',
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
			{
				let $0 = $.derived(() => defaultChartPadding({ right: 10 }));

				LineChart($$anchor, {
					get data() {
						return data;
					},
					x: 'date',
					y: 'value',
					props: { spline: { motion: 'tween' } },
					get padding() {
						return $.get($0);
					},
					height: 300
				});
			}
		};

		$.if(node_1, ($$render) => {
			if ($.get(show)) $$render(consequent);
		});
	}

	$.reset(div);
	$.append($$anchor, fragment);

	return $.pop($$exports);
}