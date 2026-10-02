import * as $ from 'svelte/internal/server';
import { components } from "$content/index.js";
import { PAGES_NEW } from "$lib/navigation.js";

export default function Components_list($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const list = components.filter((c) => {
			if (c.title === "Components") return false;

			return true;
		});

		$$renderer.push(`<div class="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-x-8 lg:gap-x-16 lg:gap-y-6 xl:gap-x-20"><!--[-->`);

		const each_array = $.ensure_array_like(list);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let component = each_array[$$index];

			$$renderer.push(`<a${$.attr('href', `/docs${$.stringify(component.slugFull)}`)} class="flex items-center gap-2 text-lg font-medium underline-offset-4 hover:underline md:text-base">${$.escape(component.title)} `);

			if (PAGES_NEW.includes("/docs" + component.slugFull)) {
				$$renderer.push(`<!--[0--><span class="flex size-2 rounded-full bg-svelte-orange" title="New"></span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></a>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}