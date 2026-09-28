import * as $ from 'svelte/internal/server';

export default function Footer_menu($$renderer, $$props) {
	const { items } = $$props;

	$$renderer.push(`<div class="flex-1"><div class="grid grid-cols-2 gap-8 sm:grid-cols-3"><!--[-->`);

	const each_array = $.ensure_array_like(items);

	for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
		let item = each_array[$$index_1];

		$$renderer.push(`<div class="flex flex-col gap-3">`);

		if (item?.name) {
			$$renderer.push(`<!--[0--><h4 class="text-xs font-bold uppercase tracking-widest text-foreground">${$.escape(item.name)}</h4>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (item?.items?.length > 0) {
			$$renderer.push(`<!--[0--><ul class="flex flex-col gap-1"><!--[-->`);

			const each_array_1 = $.ensure_array_like(item.items);

			for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
				let child = each_array_1[$$index];

				$$renderer.push(`<li>`);

				if (child.link) {
					$$renderer.push(`<!--[0--><a${$.attr('href', child.link || '#')} class="text-sm text-muted-foreground transition-colors hover:text-foreground">${$.escape(child.name)}</a>`);
				} else {
					$$renderer.push(`<!--[-1--><span class="text-sm text-muted-foreground">${$.escape(child.name)}</span>`);
				}

				$$renderer.push(`<!--]--></li>`);
			}

			$$renderer.push(`<!--]--></ul>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	}

	$$renderer.push(`<!--]--></div></div>`);
}