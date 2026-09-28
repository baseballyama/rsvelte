import * as $ from 'svelte/internal/server';
import { Indicator, Avatar, Badge } from "flowbite-svelte";

export default function Badge_1($$renderer) {
	$$renderer.push(`<ul class="w-full max-w-sm divide-y divide-gray-200 dark:divide-gray-700"><li class="py-3 sm:py-4"><div class="flex items-center space-x-3 rtl:space-x-reverse">`);
	Avatar($$renderer, { src: '/images/profile-picture-5.webp', alt: 'Neil image' });
	$$renderer.push(`<!----> <div class="min-w-0 flex-1"><p class="truncate text-sm font-semibold text-gray-900 dark:text-white">Neil Sims</p> <p class="truncate text-sm text-gray-500 dark:text-gray-400">email@flowbite.com</p></div> `);

	Badge($$renderer, {
		color: 'green',
		class: 'px-2.5 py-0.5',
		children: ($$renderer) => {
			Indicator($$renderer, { color: 'green', size: 'xs', class: 'me-1' });
			$$renderer.push(`<!---->Available`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></li> <li class="py-3 sm:py-4"><div class="flex items-center space-x-3 rtl:space-x-reverse"><div class="shrink-0">`);
	Avatar($$renderer, { src: '/images/profile-picture-4.webp', alt: 'Bonnie image' });
	$$renderer.push(`<!----></div> <div class="min-w-0 flex-1"><p class="truncate text-sm font-semibold text-gray-900 dark:text-white">Bonnie Green</p> <p class="truncate text-sm text-gray-500 dark:text-gray-400">email@flowbite.com</p></div> `);

	Badge($$renderer, {
		color: 'red',
		class: 'px-2.5 py-0.5',
		children: ($$renderer) => {
			Indicator($$renderer, { color: 'red', size: 'xs', class: 'me-1' });
			$$renderer.push(`<!---->Unavailable`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></li></ul>`);
}