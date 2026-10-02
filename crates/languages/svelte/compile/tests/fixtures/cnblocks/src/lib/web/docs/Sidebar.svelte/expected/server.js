import * as $ from 'svelte/internal/server';
import { page } from "$app/state";
import Badge from "$lib/components/ui/badge/badge.svelte";
import { cn } from "$lib/utils";

export default function Sidebar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let routes = [
			{ name: "Introduction", slug: "/docs" },
			{ name: "Installation", slug: "/docs/installation" },
			{ name: "MCP Server", slug: "/docs/mcp", isNew: true },
			{ name: "Sponsors", slug: "/docs/sponsors" }
		];

		let isActive = (slug) => {
			return page.url.pathname === slug;
		};

		$$renderer.push(`<aside class="bg-main sticky top-28 w-[180px] flex-1 max-lg:hidden"><nav class="flex h-full [scrollbar-width:none] flex-col gap-6 overflow-y-auto [-ms-overflow-style:none] max-lg:hidden [&amp;::-webkit-scrollbar]:hidden"><div class="flex flex-col gap-1"><span class="text-sm font-medium text-foreground">Getting Started</span> <div class="flex flex-col"><!--[-->`);

		const each_array = $.ensure_array_like(routes);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];

			$$renderer.push(`<a${$.attr('href', item.slug)}${$.attr_class($.clsx(cn("relative mt-1 -ml-1.5 flex items-center justify-between gap-4 rounded-lg border border-transparent px-2 py-1.5 text-sm text-muted-foreground transition-all duration-200 outline-none select-none hover:text-primary focus-visible:border-neutral-200 focus-visible:bg-muted/10 dark:focus-visible:border-neutral-800", { "text-primary": isActive(item.slug) })))}><span class="relative z-[1] block text-sm">${$.escape(item.name)}</span> `);

			if (item.isNew) {
				$$renderer.push('<!--[0-->');

				Badge($$renderer, {
					variant: 'secondary',
					class: 'rounded-full font-medium',
					children: ($$renderer) => {
						$$renderer.push(`<!---->New`);
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></a>`);
		}

		$$renderer.push(`<!--]--></div></div></nav></aside>`);
	});
}