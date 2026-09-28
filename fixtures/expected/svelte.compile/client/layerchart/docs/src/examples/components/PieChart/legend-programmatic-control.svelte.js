import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PieChart } from 'layerchart';
import { Button, ButtonGroup } from 'svelte-ux';
import { longData } from '$lib/utils/data';

var root = $.from_html(`<div class="flex gap-1 mb-2 items-center flex-wrap"><!> <!></div> <!>`, 1);

export default function Legend_programmatic_control($$anchor, $$props) {
	$.push($$props, true);

	const data = longData.filter((d) => d.year === 2019);

	const slices = [
		{ key: 'apples', color: 'var(--color-apples)' },
		{ key: 'bananas', color: 'var(--color-bananas)' },
		{ key: 'cherries', color: 'var(--color-cherries)' },
		{ key: 'grapes', color: 'var(--color-grapes)' }
	];

	let context = $.state(void 0);
	var $$exports = { data };
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	$.each(node, 17, () => slices, (s) => s.key, ($$anchor, s) => {
		const isVisible = $.derived(() => $.get(context)?.series.isVisible($.get(s).key) ?? true);

		{
			let $0 = $.derived(() => $.get(s).color);

			let $1 = $.derived(() => $.get(isVisible)
				? `--bg-color: ${$.get(s).color}; --text-color: white`
				: `--text-color: ${$.get(s).color}`);

			Button($$anchor, {
				variant: 'outline',
				size: 'sm',
				rounded: 'full',
				get style() {
					return `--border-color: ${$.get($0) ?? ''}; ${$.get($1) ?? ''}`;
				},
				onclick: () => $.get(context)?.series.selectedKeys.toggle($.get(s).key),
				onpointerenter: () => {
					if ($.get(context) && $.get(isVisible)) $.get(context).series.highlightKey = $.get(s).key;
				},

				onpointerleave: () => {
					if ($.get(context)) $.get(context).series.highlightKey = null;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text();

					$.template_effect(() => $.set_text(text, $.get(s).key));
					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		}
	});

	var node_1 = $.sibling(node, 2);

	ButtonGroup(node_1, {
		variant: 'fill-light',
		size: 'sm',
		class: 'ml-auto',
		children: ($$anchor, $$slotProps) => {
			Button($$anchor, {
				onclick: () => $.get(context)?.series.selectedKeys.clear(),
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
		let $0 = $.derived(() => slices.map((s) => s.color));

		PieChart(node_2, {
			get data() {
				return data;
			},
			key: 'fruit',
			value: 'value',
			get cRange() {
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