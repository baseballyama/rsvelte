import * as $ from 'svelte/internal/server';
import { VirtualList } from "flowbite-svelte";

export default function NoContainment($$renderer) {
	const items = Array.from({ length: 5000 }, (_, i) => `Item ${i + 1}`);

	{
		function children($$renderer, item, index) {
			$$renderer.push(`<div class="border-b p-3 text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-800">${$.escape(index + 1)}: ${$.escape(item)}</div>`);
		}

		VirtualList($$renderer, { items, children, $$slots: { default: true } });
	}
}