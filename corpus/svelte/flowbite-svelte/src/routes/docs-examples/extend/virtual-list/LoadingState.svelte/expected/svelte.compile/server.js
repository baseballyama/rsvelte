import * as $ from 'svelte/internal/server';
import { VirtualList, Button, Spinner } from "flowbite-svelte";

export default function LoadingState($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let items = [];
		let isLoading = false;

		async function loadItems() {
			isLoading = true;

			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1500));

			items = Array.from({ length: 3000 }, (_, i) => `Item ${i + 1}`);
			isLoading = false;
		}

		$$renderer.push(`<div class="space-y-4">`);

		Button($$renderer, {
			onclick: loadItems,
			disabled: isLoading,
			children: ($$renderer) => {
				if (isLoading) {
					$$renderer.push('<!--[0-->');
					Spinner($$renderer, { class: 'mr-2', size: '4' });
					$$renderer.push(`<!----> Loading...`);
				} else {
					$$renderer.push(`<!--[-1-->Load Items`);
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		if (items.length === 0 && !isLoading) {
			$$renderer.push(`<!--[0--><div class="rounded-lg border p-8 text-center text-gray-500 dark:text-gray-400" style="height:400px"><div class="mb-4 text-6xl">📋</div> <p class="text-lg font-medium">No items yet</p> <p class="text-sm">Click the button above to load items</p></div>`);
		} else if (isLoading) {
			$$renderer.push(`<!--[1--><div class="flex items-center justify-center rounded-lg border p-8" style="height:400px"><div class="text-center">`);
			Spinner($$renderer, { size: '12' });
			$$renderer.push(`<!----> <p class="mt-4 text-gray-600 dark:text-gray-400">Loading items...</p></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');

			{
				function children($$renderer, item, index) {
					$$renderer.push(`<div class="border-b p-2 text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-800">${$.escape(index + 1)}: ${$.escape(item)}</div>`);
				}

				VirtualList($$renderer, {
					items,
					minItemHeight: 40,
					height: 400,
					class: 'rounded-lg border',
					children,
					$$slots: { default: true }
				});
			}
		}

		$$renderer.push(`<!--]--></div>`);
	});
}