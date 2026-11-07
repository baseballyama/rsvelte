import * as $ from 'svelte/internal/server';
import { Check } from "$lib/icons/index.js";
import { getContext } from "svelte";
import { fade } from "svelte/transition";

export default function Item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value, children } = $$props;
		const rootState = getContext("select");

		$$renderer.push(`<button class="hover:bg-kui-light-gray-100 dark:hover:bg-kui-dark-gray-100 relative flex w-full cursor-pointer items-center rounded-xs bg-transparent px-2 py-1.5 text-sm transition-colors">`);

		if (rootState.getSelected() === value) {
			$$renderer.push(`<!--[0--><div class="absolute right-2"><div class="flex h-full w-full items-center justify-center"><div class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 h-3.5 w-3.5">`);
			Check($$renderer, {});
			$$renderer.push(`<!----></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <span class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 first-letter:capitalize">`);
		children($$renderer);
		$$renderer.push(`<!----></span></button>`);
	});
}