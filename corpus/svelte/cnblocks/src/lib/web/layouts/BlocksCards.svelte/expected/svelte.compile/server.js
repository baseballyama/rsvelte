import * as $ from 'svelte/internal/server';
import { category_blocks } from "$lib/all_blocks/category_block";
import { Button } from "$lib/components/ui/button";

export default function BlocksCards($$renderer) {
	$$renderer.push(`<div><div class="mx-auto my-20 flex max-w-5xl flex-wrap items-center justify-center gap-2.5 px-4 md:px-8"><!--[-->`);

	const each_array = $.ensure_array_like(category_blocks);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let { title, href, length } = each_array[$$index];

		Button($$renderer, {
			href,
			size: 'extralg',
			variant: 'outline',
			children: ($$renderer) => {
				$$renderer.push(`<!---->${$.escape(title)} <span class="rounded-xl border bg-secondary px-2 font-display">${$.escape(length)}</span>`);
			},
			$$slots: { default: true }
		});
	}

	$$renderer.push(`<!--]--></div></div>`);
}