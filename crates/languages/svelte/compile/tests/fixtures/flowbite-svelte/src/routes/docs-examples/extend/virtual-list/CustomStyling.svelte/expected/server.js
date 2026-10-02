import * as $ from 'svelte/internal/server';
import { VirtualList } from "flowbite-svelte";

export default function CustomStyling($$renderer) {
	const items = Array.from({ length: 2000 }, (_, i) => ({
		id: i + 1,
		name: `User ${i + 1}`,
		email: `user${i + 1}@example.com`,
		status: i % 3 === 0 ? "active" : i % 3 === 1 ? "pending" : "inactive"
	}));

	{
		function children($$renderer, item, index) {
			const user = item;

			$$renderer.push(`<div${$.attr_class(`flex items-center justify-between border-b p-4 transition-colors ${index % 2 === 0
				? 'bg-white dark:bg-gray-900'
				: 'bg-gray-50 dark:bg-gray-800'} hover:bg-blue-50 dark:hover:bg-blue-900/20`)} style="height:70px"><div class="flex-1"><div class="font-medium text-gray-900 dark:text-white">${$.escape(user.name)}</div> <div class="text-sm text-gray-500 dark:text-gray-400">${$.escape(user.email)}</div></div> <span${$.attr_class(`rounded-full px-3 py-1 text-xs font-semibold ${user.status === 'active'
				? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
				: user.status === 'pending'
					? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
					: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`)}>${$.escape(user.status)}</span></div>`);
		}

		VirtualList($$renderer, {
			items,
			minItemHeight: 70,
			height: 400,
			class: 'rounded-lg border',
			children,
			$$slots: { default: true }
		});
	}
}