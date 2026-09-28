import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from "svelte";
import { Button } from "$lib/components/ui/veil/button";
import Logo from "$lib/components/web/Logo.svelte";
import { cn } from "$lib/utils";
import ChevronRight from "@lucide/svelte/icons/chevron-right";
import Menu from "@lucide/svelte/icons/menu";
import X from "@lucide/svelte/icons/x";

var root = $.from_html(`<span> </span>`);
var root_1 = $.from_html(`<li><!></li>`);
var root_2 = $.from_html(`<span>Get started</span> <!>`, 1);
var root_3 = $.from_html(`<div><a href="/" aria-label="home" class="px-3.5"><!></a> <div><ul class="flex gap-1 max-lg:flex-col"></ul> <!></div></div>`);
var root_4 = $.from_html(`<span>Login</span>`);
var root_5 = $.from_html(`<span>Sign Up</span>`);
var root_6 = $.from_html(`<header><nav class="fixed z-20 w-full"><div class="mx-auto max-w-7xl px-6"><div class="relative flex flex-wrap items-center justify-between gap-6 py-6 lg:gap-0"><div><div class="hidden size-fit lg:block"><ul class="flex gap-1 max-lg:flex-col"></ul></div> <a href="/" aria-label="home" class="flex items-center space-x-2 lg:hidden"><!></a> <button class="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"><!> <!></button></div> <!> <div class="mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl bg-card p-6 shadow-2xl ring-1 shadow-zinc-300/20 ring-border in-data-[state=active]:block md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:ring-transparent lg:in-data-[state=active]:flex dark:shadow-none dark:lg:bg-transparent"><div class="lg:hidden"><ul class="flex gap-1 max-lg:flex-col"></ul></div> <div><!> <!></div></div></div></div></nav></header>`);

export default function Header_two($$anchor, $$props) {
	$.push($$props, true);

	const menuItems = [
		{ name: "Features", href: "#link" },
		{ name: "Pricing", href: "#link" },
		{ name: "Company", href: "#link" }
	];

	let menuState = false;
	let isScrolled = false;
	let isLarge = false;

	onMount(() => {
		const media = window.matchMedia("(min-width: 64rem)");

		const handleScroll = () => {
			isScrolled = window.scrollY > 75;
		};

		const handleMedia = () => {
			isLarge = media.matches;
		};

		handleScroll();
		handleMedia();
		window.addEventListener("scroll", handleScroll);
		media.addEventListener("change", handleMedia);

		return () => {
			window.removeEventListener("scroll", handleScroll);
			media.removeEventListener("change", handleMedia);
		};
	});

	var header = root_6();
	var nav = $.child(header);
	var div = $.child(nav);
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var ul = $.child(div_3);

	$.each(ul, 21, () => menuItems, $.index, ($$anchor, item) => {
		var li = root_1();
		var node = $.child(li);

		Button(node, {
			variant: 'ghost',
			size: 'sm',
			class: 'w-full text-base max-lg:h-12 max-lg:justify-start max-lg:text-lg',
			get href() {
				return $.get(item).href;
			},

			children: ($$anchor, $$slotProps) => {
				var span = root();
				var text = $.only_child(span, true);

				$.template_effect(() => $.set_text(text, $.get(item).name));
				$.append($$anchor, span);
			},
			$$slots: { default: true }
		});

		$.reset(li);
		$.append($$anchor, li);
	});

	$.reset(ul);
	$.reset(div_3);

	var a = $.sibling(div_3, 2);
	var node_1 = $.child(a);

	Logo(node_1, {});
	$.reset(a);

	var button = $.sibling(a, 2);
	var node_2 = $.child(button);

	Menu(node_2, {
		class: 'm-auto size-6 duration-200 in-data-[state=active]:scale-0 in-data-[state=active]:rotate-180 in-data-[state=active]:opacity-0'
	});

	var node_3 = $.sibling(node_2, 2);

	X(node_3, {
		class: 'absolute inset-0 m-auto size-6 scale-0 -rotate-180 opacity-0 duration-200 in-data-[state=active]:scale-100 in-data-[state=active]:rotate-0 in-data-[state=active]:opacity-100'
	});

	$.reset(button);
	$.reset(div_2);

	var node_4 = $.sibling(div_2, 2);

	{
		var consequent = ($$anchor) => {
			var div_4 = root_3();
			var a_1 = $.child(div_4);
			var node_5 = $.child(a_1);

			Logo(node_5, {});
			$.reset(a_1);

			var div_5 = $.sibling(a_1, 2);
			var ul_1 = $.child(div_5);

			$.each(ul_1, 21, () => menuItems, $.index, ($$anchor, item) => {
				var li_1 = root_1();
				var node_6 = $.child(li_1);

				Button(node_6, {
					variant: 'ghost',
					size: 'sm',
					class: 'w-full text-base max-lg:h-12 max-lg:justify-start max-lg:text-lg',
					get href() {
						return $.get(item).href;
					},

					children: ($$anchor, $$slotProps) => {
						var span_1 = root();
						var text_1 = $.only_child(span_1, true);

						$.template_effect(() => $.set_text(text_1, $.get(item).name));
						$.append($$anchor, span_1);
					},
					$$slots: { default: true }
				});

				$.reset(li_1);
				$.append($$anchor, li_1);
			});

			$.reset(ul_1);

			var node_7 = $.sibling(ul_1, 2);

			Button(node_7, {
				size: 'sm',
				class: 'mx-2 gap-1 pr-1',
				href: '/',
				children: ($$anchor, $$slotProps) => {
					var fragment = root_2();
					var node_8 = $.sibling($.first_child(fragment), 2);

					ChevronRight(node_8, { class: 'opacity-50' });
					$.append($$anchor, fragment);
				},
				$$slots: { default: true }
			});

			$.reset(div_5);
			$.reset(div_4);

			$.template_effect(
				($0, $1) => {
					$.set_class(div_4, 1, $0);
					$.set_class(div_5, 1, $1);
				},
				[
					() => $.clsx(cn("absolute inset-0 z-50 m-auto flex size-fit h-11 items-center rounded-lg transition-all duration-500", isScrolled
						? "gap-4 bg-card shadow-lg ring-1 shadow-foreground/6.5 ring-border backdrop-blur"
						: "gap-0 bg-transparent")),

					() => $.clsx(cn("flex origin-left items-center overflow-hidden rounded-full transition-all duration-500", isScrolled
						? "blur-0 max-w-[32rem] opacity-100"
						: "max-w-0 -translate-x-8 scale-95 opacity-0 blur-[4px]"))
				]
			);

			$.append($$anchor, div_4);
		};

		$.if(node_4, ($$render) => {
			if (isLarge) $$render(consequent);
		});
	}

	var div_6 = $.sibling(node_4, 2);
	var div_7 = $.child(div_6);
	var ul_2 = $.child(div_7);

	$.each(ul_2, 21, () => menuItems, $.index, ($$anchor, item) => {
		var li_2 = root_1();
		var node_9 = $.child(li_2);

		Button(node_9, {
			variant: 'ghost',
			size: 'sm',
			class: 'w-full text-base max-lg:h-12 max-lg:justify-start max-lg:text-lg',
			get href() {
				return $.get(item).href;
			},

			children: ($$anchor, $$slotProps) => {
				var span_2 = root();
				var text_2 = $.only_child(span_2, true);

				$.template_effect(() => $.set_text(text_2, $.get(item).name));
				$.append($$anchor, span_2);
			},
			$$slots: { default: true }
		});

		$.reset(li_2);
		$.append($$anchor, li_2);
	});

	$.reset(ul_2);
	$.reset(div_7);

	var div_8 = $.sibling(div_7, 2);
	var node_10 = $.child(div_8);

	Button(node_10, {
		variant: 'ghost',
		size: 'sm',
		href: '/',
		children: ($$anchor, $$slotProps) => {
			var span_3 = root_4();

			$.append($$anchor, span_3);
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_10, 2);

	Button(node_11, {
		size: 'sm',
		href: '/',
		children: ($$anchor, $$slotProps) => {
			var span_4 = root_5();

			$.append($$anchor, span_4);
		},
		$$slots: { default: true }
	});

	$.reset(div_8);
	$.reset(div_6);
	$.reset(div_1);
	$.reset(div);
	$.reset(nav);
	$.reset(header);

	$.template_effect(
		($0, $1) => {
			$.set_attribute(nav, 'data-state', menuState ? "active" : undefined);
			$.set_class(div_2, 1, $0);
			$.set_attribute(button, 'aria-label', menuState ? "Close Menu" : "Open Menu");
			$.set_class(div_8, 1, $1);
		},
		[
			() => $.clsx(cn("flex justify-between gap-6 duration-200 max-lg:w-full", isScrolled && "lg:opacity-0 lg:blur-[4px]")),
			() => $.clsx(cn("flex w-full flex-col space-y-3 duration-200 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit", isScrolled && "lg:opacity-0 lg:blur-[4px]"))
		]
	);

	$.delegated('click', button, () => menuState = !menuState);
	$.append($$anchor, header);
	$.pop();
}

$.delegate(['click']);