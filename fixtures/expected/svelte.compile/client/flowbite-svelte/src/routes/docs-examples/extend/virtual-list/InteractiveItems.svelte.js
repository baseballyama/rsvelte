import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { VirtualList, Button, Checkbox } from "flowbite-svelte";
import { TrashBinSolid } from "flowbite-svelte-icons";

var root = $.from_html(`<div class="flex items-center gap-3 border-b p-3 hover:bg-gray-50 dark:hover:bg-gray-800" style="height:50px"><!> <span> </span> <!></div>`);
var root_1 = $.from_html(`<div class="space-y-4"><div class="flex items-center justify-between"><span class="text-sm text-gray-600 dark:text-gray-400"> </span> <!></div> <!></div>`);

export default function InteractiveItems($$anchor, $$props) {
	$.push($$props, true);

	let items = $.state($.proxy(Array.from({ length: 2000 }, (_, i) => ({ id: i + 1, text: `Task ${i + 1}`, completed: false }))));
	let selectedCount = $.derived(() => $.get(items).filter((item) => item.completed).length);

	function toggleItem(id) {
		const item = $.get(items).find((i) => i.id === id);

		if (item) item.completed = !item.completed;
	}

	function deleteItem(id) {
		$.set(items, $.get(items).filter((item) => item.id !== id), true);
	}

	function clearCompleted() {
		$.set(items, $.get(items).filter((item) => !item.completed), true);
	}

	var div = root_1();
	var div_1 = $.child(div);
	var span = $.child(div_1);
	var text = $.only_child(span);
	var node = $.sibling(span, 2);

	{
		var consequent = ($$anchor) => {
			Button($$anchor, {
				size: 'xs',
				color: 'red',
				onclick: clearCompleted,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Clear Completed');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});
		};

		$.if(node, ($$render) => {
			if ($.get(selectedCount) > 0) $$render(consequent);
		});
	}

	$.reset(div_1);

	var node_1 = $.sibling(div_1, 2);

	{
		const children = ($$anchor, item = $.noop, _index = $.noop) => {
			const task = $.derived(item);
			var div_2 = root();
			var node_2 = $.child(div_2);

			Checkbox(node_2, {
				get checked() {
					return $.get(task).completed;
				},
				onchange: () => toggleItem($.get(task).id)
			});

			var span_1 = $.sibling(node_2, 2);
			var text_2 = $.only_child(span_1, true);
			var node_3 = $.sibling(span_1, 2);

			Button(node_3, {
				size: 'xs',
				color: 'red',
				class: '!p-2',
				onclick: () => deleteItem($.get(task).id),
				children: ($$anchor, $$slotProps) => {
					TrashBinSolid($$anchor, { class: 'h-3 w-3' });
				},
				$$slots: { default: true }
			});

			$.reset(div_2);

			$.template_effect(() => {
				$.set_class(span_1, 1, `flex-1 ${$.get(task).completed
					? 'text-gray-400 line-through'
					: 'text-gray-900 dark:text-white'}`);

				$.set_text(text_2, $.get(task).text);
			});

			$.append($$anchor, div_2);
		};

		VirtualList(node_1, {
			get items() {
				return $.get(items);
			},
			minItemHeight: 50,
			height: 400,
			class: 'rounded-lg border',
			children,
			$$slots: { default: true }
		});
	}

	$.reset(div);
	$.template_effect(() => $.set_text(text, `${$.get(selectedCount) ?? ''} of ${$.get(items).length ?? ''} completed`));
	$.append($$anchor, div);
	$.pop();
}