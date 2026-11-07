import * as $ from 'svelte/internal/server';
import { VirtualList, Button, Checkbox } from "flowbite-svelte";
import { TrashBinSolid } from "flowbite-svelte-icons";

export default function InteractiveItems($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let items = Array.from({ length: 2000 }, (_, i) => ({ id: i + 1, text: `Task ${i + 1}`, completed: false }));
		let selectedCount = $.derived(() => items.filter((item) => item.completed).length);

		function toggleItem(id) {
			const item = items.find((i) => i.id === id);

			if (item) item.completed = !item.completed;
		}

		function deleteItem(id) {
			items = items.filter((item) => item.id !== id);
		}

		function clearCompleted() {
			items = items.filter((item) => !item.completed);
		}

		$$renderer.push(`<div class="space-y-4"><div class="flex items-center justify-between"><span class="text-sm text-gray-600 dark:text-gray-400">${$.escape(selectedCount())} of ${$.escape(items.length)} completed</span> `);

		if (selectedCount() > 0) {
			$$renderer.push('<!--[0-->');

			Button($$renderer, {
				size: 'xs',
				color: 'red',
				onclick: clearCompleted,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Clear Completed`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> `);

		{
			function children($$renderer, item, _index) {
				const task = item;

				$$renderer.push(`<div class="flex items-center gap-3 border-b p-3 hover:bg-gray-50 dark:hover:bg-gray-800" style="height:50px">`);
				Checkbox($$renderer, { checked: task.completed, onchange: () => toggleItem(task.id) });

				$$renderer.push(`<!----> <span${$.attr_class(`flex-1 ${task.completed
					? 'text-gray-400 line-through'
					: 'text-gray-900 dark:text-white'}`)}>${$.escape(task.text)}</span> `);

				Button($$renderer, {
					size: 'xs',
					color: 'red',
					class: '!p-2',
					onclick: () => deleteItem(task.id),
					children: ($$renderer) => {
						TrashBinSolid($$renderer, { class: 'h-3 w-3' });
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			}

			VirtualList($$renderer, {
				items,
				minItemHeight: 50,
				height: 400,
				class: 'rounded-lg border',
				children,
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!----></div>`);
	});
}