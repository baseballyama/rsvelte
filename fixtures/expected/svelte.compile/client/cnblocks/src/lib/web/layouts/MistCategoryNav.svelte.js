import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from "$app/state";
import { all_mists_category_block } from "$lib/all_blocks/category_block";
import ScrollArea from "$lib/components/ui/scroll-area/scroll-area.svelte";
import { cn } from "$lib/utils";

var root = $.from_html(`<li><a><span class="block w-max text-nowrap capitalize"> </span></a></li>`);
var root_1 = $.from_html(`<ul class="relative mx-auto -mb-px flex h-11 snap-x snap-proximity scroll-px-6 items-center gap-6 overflow-x-auto overflow-y-hidden px-6 lg:scroll-px-2 lg:gap-4"></ul>`);
var root_2 = $.from_html(`<div class="relative z-40 border-b dark:border-border/50"><div class="mx-auto max-w-7xl"><nav class="flex items-center lg:-mx-3"><!></nav></div></div>`);

export default function MistCategoryNav($$anchor, $$props) {
	$.push($$props, true);

	let pathname = $.derived(() => "/" + page.url.pathname.split("/").filter(Boolean)[0] || "/");

	let isActive = (href) => {
		return page.url.pathname === href;
	};

	var div = root_2();
	var div_1 = $.child(div);
	var nav = $.child(div_1);
	var node = $.child(nav);

	ScrollArea(node, {
		orientation: 'horizontal',
		class: 'w-full',
		children: ($$anchor, $$slotProps) => {
			var ul = root_1();

			$.each(ul, 21, () => all_mists_category_block, $.index, ($$anchor, category) => {
				var li = root();
				var a = $.child(li);
				var span = $.child(a);
				var text = $.only_child(span, true);

				$.reset(a);
				$.reset(li);

				$.template_effect(
					($0, $1) => {
						$.set_class(li, 1, $0);
						$.set_attribute(a, 'href', $.get(category).href);
						$.set_class(a, 1, $1);
						$.set_text(text, $.get(category).title);
					},
					[
						() => $.clsx(cn("flex h-full snap-start items-center border-b border-b-transparent", isActive($.get(category).href) && "border-primary")),
						() => $.clsx(cn(isActive($.get(category).href) && "text-primary!", "flex h-7 w-fit items-center rounded-full px-1 text-[13px] text-nowrap text-zinc-700 transition-all duration-300 hover:bg-muted hover:text-foreground lg:-mx-2 lg:px-3 dark:text-muted-foreground"))
					]
				);

				$.append($$anchor, li);
			});

			$.reset(ul);
			$.append($$anchor, ul);
		},
		$$slots: { default: true }
	});

	$.reset(nav);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}