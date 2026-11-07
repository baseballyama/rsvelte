import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LineChart, defaultChartPadding } from 'layerchart';
import { Button, ButtonGroup } from 'svelte-ux';
import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<button class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium transition-all"> </button>`);
var root_1 = $.from_html(`<div class="flex gap-2 mb-2 items-center flex-wrap"><!> <!></div> <!>`, 1);

export default function Series_programmatic_control($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({
		count: 30,
		min: 10,
		max: 100,
		value: 'integer',
		keys: ['apples', 'bananas', 'oranges']
	});

	const series = [
		{ key: 'apples', color: 'var(--color-apples)' },
		{
			key: 'bananas',
			color: 'var(--color-bananas)',
			selected: false
		},
		{ key: 'oranges', color: 'var(--color-oranges)' }
	];

	let context = $.state(void 0);
	var $$exports = { data };
	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.child(div);

	$.each(node, 17, () => series, (s) => s.key, ($$anchor, s) => {
		const isVisible = $.derived(() => $.get(context)?.series?.isVisible($.get(s).key) ?? true);
		var button = root();
		let styles;
		var text = $.only_child(button, true);

		$.template_effect(() => {
			styles = $.set_style(button, '', styles, {
				'background-color': $.get(isVisible) ? $.get(s).color : 'transparent',
				color: $.get(isVisible) ? 'white' : 'var(--color-surface-content)',
				border: `2px solid ${$.get(s).color ?? ''}`,
				opacity: $.get(isVisible) ? 1 : 0.4
			});

			$.set_text(text, $.get(s).key);
		});

		$.delegated('click', button, () => $.get(context)?.series?.selectedKeys?.toggle($.get(s).key));
		$.append($$anchor, button);
	});

	var node_1 = $.sibling(node, 2);

	ButtonGroup(node_1, {
		variant: 'fill-light',
		size: 'sm',
		class: 'ml-auto',
		children: ($$anchor, $$slotProps) => {
			Button($$anchor, {
				onclick: () => $.get(context)?.series?.selectedKeys?.clear(),
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Show All');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var node_2 = $.sibling(div, 2);

	{
		let $0 = $.derived(() => defaultChartPadding({ right: 10 }));

		LineChart(node_2, {
			get data() {
				return data;
			},
			x: 'date',
			get series() {
				return series;
			},

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

$.delegate(['click']);