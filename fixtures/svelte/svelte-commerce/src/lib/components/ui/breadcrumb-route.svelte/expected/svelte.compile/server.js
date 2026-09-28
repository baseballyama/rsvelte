import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { ChevronRight, Home } from '@lucide/svelte';

export default function Breadcrumb_route($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { items: providedItems, product } = $$props;
		let items = [];
		let isProductsPage = $.derived(() => page.route?.id === '/(www)/products/[slug]');

		$$renderer.push(`<nav class="flex overflow-hidden truncate" aria-label="Breadcrumb"><div class="inline-flex items-center space-x-1 text-sm md:space-x-2"><div class="inline-flex items-center"><a href="/" class="inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">`);
		Home($$renderer, { class: 'mr-2 h-4 w-4' });
		$$renderer.push(`<!----> Home</a></div> <ol class="hidden sm:inline-flex md:items-center md:space-x-2"><!--[-->`);

		const each_array = $.ensure_array_like(
			// if (path?.isCategory) {
			// } else {
			// 	href =
			// 		'/' +
			// 		paths
			// 			?.map((p) => p?.name)
			// 			?.slice(0, index + 1)
			// 			.join('/')
			// }
			// Remove hyphens and replace with spaces
			// Convert to title case
			items
		);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let { label, href } = each_array[i];

			$$renderer.push(`<li><div class="flex w-max items-center">`);
			ChevronRight($$renderer, { class: 'h-4 min-h-4 w-4 min-w-4 text-gray-400' });
			$$renderer.push(`<!----> <div class="grid grid-cols-1">`);

			if (href && i < items.length - 1) {
				$$renderer.push(`<!--[0--><a${$.attr('href', href)} class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white md:ml-2">${$.escape(label)}</a>`);
			} else {
				$$renderer.push(`<!--[-1--><span class="truncate text-gray-600 dark:text-gray-300 md:ml-2">${$.escape(label)}</span>`);
			}

			$$renderer.push(`<!--]--></div></div></li>`);
		}

		$$renderer.push(`<!--]--></ol> <ol class="flex sm:hidden">`);

		if (items?.length > 1) {
			$$renderer.push(`<!--[0--><li><div class="flex items-center">`);
			ChevronRight($$renderer, { class: 'h-4 w-4 text-gray-400' });
			$$renderer.push(`<!----> <span class="ml-1 text-gray-600 dark:text-gray-300 md:ml-2">...</span> `);
			ChevronRight($$renderer, { class: 'h-4 w-4 text-gray-400' });
			$$renderer.push(`<!----></div></li>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <li><div class="grid grid-cols-1"><a${$.attr('href', items?.[items?.length - 1]?.href)} class="ml-1 truncate text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white md:ml-2">${$.escape(items?.[items?.length - 1]?.label)}</a></div></li></ol></div></nav>`);
	});
}