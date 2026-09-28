import * as $ from 'svelte/internal/server';
import { page } from "$app/state";
import { cn } from "$lib/utils/styles.js";

export default function Sidebar_nav_items($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { items = [] } = $$props;

		if (items.length) {
			$$renderer.push(`<!--[0--><div class="grid grid-flow-row auto-rows-max gap-[1px] pl-4 text-sm"><!--[-->`);

			const each_array = $.ensure_array_like(items);

			for (let index = 0, $$length = each_array.length; index < $$length; index++) {
				let item = each_array[index];

				if (item.href) {
					$$renderer.push(`<!--[0--><a${$.attr('href', item.href)}${$.attr_class($.clsx(cn("text-foreground focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:outline-hidden group inline-flex w-full items-center rounded-md px-2.5 py-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2", item.disabled && "cursor-not-allowed opacity-60 ", page.url.pathname === item.href ? "bg-muted" : "hover:bg-muted/50")))}${$.attr('target', item.external ? "_blank" : "")}${$.attr('rel', item.external ? "noreferrer" : "")}>${$.escape(item.title)} `);

					if (item.label) {
						$$renderer.push(`<!--[0--><span class="ml-2 rounded-[4px] bg-[#FCDAFE] px-1.5 py-1 text-[0.7rem] font-semibold leading-none text-[#2A266B] no-underline group-hover:no-underline">${$.escape(item.label)}</span>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></a>`);
				} else {
					$$renderer.push(`<!--[-1--><span class="text-muted-foreground flex w-full cursor-not-allowed items-center rounded-md px-2.5 py-1.5 text-sm hover:underline">${$.escape(item.title)}</span>`);
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}