import * as $ from 'svelte/internal/server';
import { CloseButton } from "flowbite-svelte";

export default function Default($$renderer) {
	let visible = true;

	if (visible) {
		$$renderer.push(`<!--[0--><div id="banner" tabindex="-1" class="z-50 flex w-full items-start justify-between gap-8 border border-b border-gray-200 bg-gray-50 px-4 py-3 sm:items-center lg:py-4 dark:border-gray-700 dark:bg-gray-800"><p class="text-sm font-light text-gray-500 dark:text-gray-400">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Dolorem, ipsa culpa ea laudantium earum quis? Neque unde aliquam enim, distinctio repellendus delectus? Illo numquam ex fugit dolor
      esse, cumque nesciunt?</p> `);

		CloseButton($$renderer, { onclick: () => visible = false });
		$$renderer.push(`<!----></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}