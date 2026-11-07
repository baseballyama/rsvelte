import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LineChart, defaultChartPadding } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';
import { slide } from 'svelte/transition';
import ShowControls from '$lib/components/controls/fields/ShowField.svelte';

var root = $.from_html(`<!> <div class="h-[300px]"><!></div>`, 1);

export default function Draw($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
	let show = $.state(void 0);
	var $$exports = { data };
	var fragment = root();
	var node = $.first_child(fragment);

	ShowControls(node, {
		label: 'Show Line',
		get show() {
			return $.get(show);
		},

		set show($$value) {
			$.set(show, $$value, true);
		}
	});

	var div = $.sibling(node, 2);
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
					get padding() {
						return $.get($0);
					},
					props: { spline: { draw: true } },
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