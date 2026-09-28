import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AreaChart, defaultChartPadding } from 'layerchart';
import { timeDay } from 'd3-time';
import { randomWalk } from '$lib/utils/data.js';
import { format } from '@layerstack/utils';

var root = $.from_html(`<div class="text-sm"><!></div> <!>`, 1);

export default function Tooltip_external($$anchor, $$props) {
	$.push($$props, true);

	const now = new Date();
	const data = randomWalk({ count: 1000 }).map((value, i) => ({ date: timeDay.offset(now, i), value: 10 + value }));
	let context = $.state(null);
	var $$exports = { data };
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var text = $.text();

			$.template_effect(
				($0, $1) => $.set_text(text, `date: ${$0 ?? ''}
		value: ${$1 ?? ''}`),
				[
					() => format($.get(context).tooltip.data.date, 'day', { variant: 'short' }),
					() => format($.get(context).tooltip.data.value, 'decimal')
				]
			);

			$.append($$anchor, text);
		};

		var alternate = ($$anchor) => {
			var text_1 = $.text('[hover chart]');

			$.append($$anchor, text_1);
		};

		$.if(node, ($$render) => {
			if ($.get(context) && $.get(context).tooltip.data) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div);

	var node_1 = $.sibling(div, 2);

	{
		let $0 = $.derived(() => defaultChartPadding({ top: 10 }));

		AreaChart(node_1, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			get padding() {
				return $.get($0);
			},
			height: 300,
			get context() {
				return $.get(context);
			},

			set context($$value) {
				$.set(context, $$value, true);
			}
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}