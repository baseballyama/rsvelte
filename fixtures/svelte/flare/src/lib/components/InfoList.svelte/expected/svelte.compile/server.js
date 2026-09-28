import * as $ from 'svelte/internal/server';

export default function InfoList($$renderer, $$props) {
	let { title, items } = $$props;

	$$renderer.push(`<div class="h-[150px] shrink-0 overflow-y-auto border-t p-4"><h3 class="text-muted-foreground mb-2 text-xs font-semibold uppercase">${$.escape(title)}</h3> <div class="flex flex-col gap-3 text-sm"><!--[-->`);

	const each_array = $.ensure_array_like(items);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];

		$$renderer.push(`<div class="flex justify-between"><span class="text-muted-foreground">${$.escape(item.label)}</span> <span>${$.escape(item.value)}</span></div>`);
	}

	$$renderer.push(`<!--]--></div></div>`);
}