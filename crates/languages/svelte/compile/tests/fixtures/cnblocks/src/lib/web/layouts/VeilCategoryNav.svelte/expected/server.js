import * as $ from 'svelte/internal/server';
import { page } from "$app/state";
import { all_veils_category_block } from "$lib/all_blocks/category_block";
import ScrollArea from "$lib/components/ui/scroll-area/scroll-area.svelte";
import { cn } from "$lib/utils";

export default function VeilCategoryNav($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let isActive = (href) => {
			return page.url.pathname === href;
		};

		$$renderer.push(`<div class="relative z-40 border-b dark:border-border/50"><div class="mx-auto max-w-7xl"><nav class="flex items-center lg:-mx-3">`);

		ScrollArea($$renderer, {
			orientation: 'horizontal',
			scrollbarXClasses: 'hidden',
			class: 'w-full',
			children: ($$renderer) => {
				$$renderer.push(`<ul class="relative mx-auto -mb-px flex h-12 snap-x snap-proximity scroll-px-6 items-center gap-6 overflow-x-auto overflow-y-hidden px-6 lg:scroll-px-2 lg:gap-4"><!--[-->`);

				const each_array = $.ensure_array_like(all_veils_category_block);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let category = each_array[$$index];

					$$renderer.push(`<li${$.attr_class($.clsx(cn("flex h-full snap-start items-center ")))}><a${$.attr('href', category.href)}${$.attr_class($.clsx(cn("flex h-7 w-fit items-center rounded-full px-1 text-[13px] text-nowrap text-zinc-700 transition-all duration-300 hover:bg-muted hover:text-foreground lg:-mx-2 lg:px-3 dark:text-muted-foreground", isActive(category.href) && "bg-muted text-primary!")))}><span class="block w-max text-nowrap capitalize">${$.escape(category.title)}</span></a></li>`);
				}

				$$renderer.push(`<!--]--></ul>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></nav></div></div>`);
	});
}