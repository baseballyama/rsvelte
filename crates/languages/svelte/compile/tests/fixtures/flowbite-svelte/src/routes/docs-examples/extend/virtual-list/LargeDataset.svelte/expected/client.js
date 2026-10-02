import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { VirtualList, Badge } from "flowbite-svelte";

var root = $.from_html(`<span class="text-gray-600 dark:text-gray-400"> </span>`);
var root_1 = $.from_html(`<div class="flex items-center justify-between border-b p-3 hover:bg-gray-50 dark:hover:bg-gray-800" style="height:45px"><span class="text-gray-900 dark:text-white"> </span> <span class="font-mono text-sm text-gray-600 dark:text-gray-400"> </span></div>`);
var root_2 = $.from_html(`<div class="space-y-4"><div class="flex items-center gap-4 text-sm"><!> <!></div> <!> <p class="text-xs text-gray-500 dark:text-gray-400">💡 Try scrolling through 100,000 items - notice how smooth it remains!</p></div>`);

export default function LargeDataset($$anchor, $$props) {
	$.push($$props, true);

	const ITEM_COUNT = 100000;

	const items = Array.from({ length: ITEM_COUNT }, (_, i) => ({
		id: i + 1,
		title: `Record ${i + 1}`,
		value: Math.floor(Math.random() * 10000)
	}));

	let renderTime = $.state(0);
	let startTime;

	function measureRenderStart() {
		startTime = performance.now();
	}

	function measureRenderEnd() {
		$.set(renderTime, performance.now() - startTime);
	}

	$.user_effect(() => {
		measureRenderStart();

		return () => measureRenderEnd();
	});

	var div = root_2();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Badge(node, {
		large: true,
		color: 'blue',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text();

			$.template_effect(($0) => $.set_text(text, `${$0 ?? ''} items`), [() => ITEM_COUNT.toLocaleString()]);
			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var span = root();
			var text_1 = $.only_child(span);

			$.template_effect(($0) => $.set_text(text_1, `Rendered in ${$0 ?? ''}ms`), [() => $.get(renderTime).toFixed(2)]);
			$.append($$anchor, span);
		};

		$.if(node_1, ($$render) => {
			if ($.get(renderTime) > 0) $$render(consequent);
		});
	}

	$.reset(div_1);

	var node_2 = $.sibling(div_1, 2);

	{
		const children = ($$anchor, item = $.noop, _index = $.noop) => {
			const record = $.derived(item);
			var div_2 = root_1();
			var span_1 = $.child(div_2);
			var text_2 = $.only_child(span_1, true);
			var span_2 = $.sibling(span_1, 2);
			var text_3 = $.only_child(span_2);

			$.reset(div_2);

			$.template_effect(
				($0) => {
					$.set_text(text_2, $.get(record).title);
					$.set_text(text_3, `$${$0 ?? ''}`);
				},
				[() => $.get(record).value.toLocaleString()]
			);

			$.append($$anchor, div_2);
		};

		VirtualList(node_2, {
			get items() {
				return items;
			},
			minItemHeight: 45,
			height: 500,
			class: 'rounded-lg border',
			children,
			$$slots: { default: true }
		});
	}

	$.next(2);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}