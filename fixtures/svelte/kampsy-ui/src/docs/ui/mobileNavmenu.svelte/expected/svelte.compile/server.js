import * as $ from 'svelte/internal/server';
import { Cross } from "$lib/icons/index.js";
import { clickOutside } from "$lib/utils/event.js";
import { fade, fly } from "svelte/transition";

export default function MobileNavmenu($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { isOpen = false, asideSlot } = $$props;

		if (isOpen) {
			$$renderer.push(`<!--[0--><div class="block lg:hidden"><div class="bg-kui-black fixed top-0 left-0 z-1000 h-full w-full opacity-[0.4] lg:hidden"></div> <div class="bg-kui-light-bg-secondary dark:bg-kui-dark-bg-secondary border-kui-light-gray-200 dark:border-kui-dark-gray-400 fixed top-0 left-0 z-1000 h-full w-[75%] border-r"><div class="absolute top-4 right-5.5 z-30 h-10 w-10"><div class="flex h-full w-full items-center justify-center"><button class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 h-4 w-4">`);
			Cross($$renderer, {});
			$$renderer.push(`<!----></button></div></div> `);
			asideSlot($$renderer);
			$$renderer.push(`<!----></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { isOpen });
	});
}