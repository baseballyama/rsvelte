import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from "$app/state";
import Badge from "$lib/components/ui/badge/badge.svelte";
import { cn } from "$lib/utils";

var root = $.from_html(`<a><span class="relative z-[1] block text-sm"> </span> <!></a>`);
var root_1 = $.from_html(`<aside class="bg-main sticky top-28 w-[180px] flex-1 max-lg:hidden"><nav class="flex h-full [scrollbar-width:none] flex-col gap-6 overflow-y-auto [-ms-overflow-style:none] max-lg:hidden [&amp;::-webkit-scrollbar]:hidden"><div class="flex flex-col gap-1"><span class="text-sm font-medium text-foreground">Getting Started</span> <div class="flex flex-col"></div></div></nav></aside>`);

export default function Sidebar($$anchor, $$props) {
	$.push($$props, true);

	let routes = [
		{ name: "Introduction", slug: "/docs" },
		{ name: "Installation", slug: "/docs/installation" },
		{ name: "MCP Server", slug: "/docs/mcp", isNew: true },
		{ name: "Sponsors", slug: "/docs/sponsors" }
	];

	let isActive = (slug) => {
		return page.url.pathname === slug;
	};

	var aside = root_1();
	var nav = $.child(aside);
	var div = $.child(nav);
	var div_1 = $.sibling($.child(div), 2);

	$.each(div_1, 21, () => routes, $.index, ($$anchor, item) => {
		var a = root();
		var span = $.child(a);
		var text = $.only_child(span, true);
		var node = $.sibling(span, 2);

		{
			var consequent = ($$anchor) => {
				Badge($$anchor, {
					variant: 'secondary',
					class: 'rounded-full font-medium',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('New');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});
			};

			$.if(node, ($$render) => {
				if ($.get(item).isNew) $$render(consequent);
			});
		}

		$.reset(a);

		$.template_effect(
			($0) => {
				$.set_attribute(a, 'href', $.get(item).slug);
				$.set_class(a, 1, $0);
				$.set_text(text, $.get(item).name);
			},
			[
				() => $.clsx(cn("relative mt-1 -ml-1.5 flex items-center justify-between gap-4 rounded-lg border border-transparent px-2 py-1.5 text-sm text-muted-foreground transition-all duration-200 outline-none select-none hover:text-primary focus-visible:border-neutral-200 focus-visible:bg-muted/10 dark:focus-visible:border-neutral-800", { "text-primary": isActive($.get(item).slug) }))
			]
		);

		$.append($$anchor, a);
	});

	$.reset(div_1);
	$.reset(div);
	$.reset(nav);
	$.reset(aside);
	$.append($$anchor, aside);
	$.pop();
}