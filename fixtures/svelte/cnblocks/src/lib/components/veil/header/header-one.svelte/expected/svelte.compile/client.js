import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from "svelte";
import { Button } from "$lib/components/ui/veil/button";
import Logo from "$lib/components/web/Logo.svelte";
import { cn } from "$lib/utils";
import Menu from "@lucide/svelte/icons/menu";
import X from "@lucide/svelte/icons/x";

var root = $.from_html(`<span> </span>`);
var root_1 = $.from_html(`<li><!></li>`);
var root_2 = $.from_html(`<li><a class="block text-muted-foreground duration-150 hover:text-accent-foreground"><span> </span></a></li>`);
var root_3 = $.from_html(`<span>Login</span>`);
var root_4 = $.from_html(`<span>Sign Up</span>`);
var root_5 = $.from_html(`<span>Get Started</span>`);
var root_6 = $.from_html(`<header><nav><div class="mx-auto max-w-5xl px-6"><div class="relative flex flex-wrap items-center justify-between gap-6 py-6 lg:gap-0"><div class="flex w-full justify-between gap-6 lg:w-auto"><a href="/" aria-label="home" class="flex items-center space-x-2"><!></a> <button class="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"><!> <!></button></div> <div class="absolute inset-0 m-auto hidden size-fit lg:block"><ul class="flex gap-1"></ul></div> <div class="mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border bg-background p-6 shadow-2xl shadow-zinc-300/20 in-data-[state=active]:block md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none lg:in-data-[state=active]:flex dark:shadow-none dark:lg:bg-transparent"><div class="lg:hidden"><ul class="space-y-6 text-base"></ul></div> <div class="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit"><!> <!> <!></div></div></div></div></nav></header>`);

export default function Header_one($$anchor, $$props) {
	$.push($$props, true);

	const menuItems = [
		{ name: "Features", href: "#link" },
		{ name: "Pricing", href: "#link" },
		{ name: "Company", href: "#link" }
	];

	let menuState = false;
	let isScrolled = false;

	onMount(() => {
		const handleScroll = () => {
			isScrolled = window.scrollY > 50;
		};

		handleScroll();
		window.addEventListener("scroll", handleScroll);

		return () => window.removeEventListener("scroll", handleScroll);
	});

	var header = root_6();
	var nav = $.child(header);
	var div = $.child(nav);
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var a = $.child(div_2);
	var node = $.child(a);

	Logo(node, {});
	$.reset(a);

	var button = $.sibling(a, 2);
	var node_1 = $.child(button);

	Menu(node_1, {
		class: 'm-auto size-6 duration-200 in-data-[state=active]:scale-0 in-data-[state=active]:rotate-180 in-data-[state=active]:opacity-0'
	});

	var node_2 = $.sibling(node_1, 2);

	X(node_2, {
		class: 'absolute inset-0 m-auto size-6 scale-0 -rotate-180 opacity-0 duration-200 in-data-[state=active]:scale-100 in-data-[state=active]:rotate-0 in-data-[state=active]:opacity-100'
	});

	$.reset(button);
	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var ul = $.child(div_3);

	$.each(ul, 21, () => menuItems, $.index, ($$anchor, item) => {
		var li = root_1();
		var node_3 = $.child(li);

		Button(node_3, {
			variant: 'ghost',
			size: 'sm',
			get href() {
				return $.get(item).href;
			},
			class: 'text-base',
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

	var div_4 = $.sibling(div_3, 2);
	var div_5 = $.child(div_4);
	var ul_1 = $.child(div_5);

	$.each(ul_1, 21, () => menuItems, $.index, ($$anchor, item) => {
		var li_1 = root_2();
		var a_1 = $.child(li_1);
		var span_1 = $.child(a_1);
		var text_1 = $.only_child(span_1, true);

		$.reset(a_1);
		$.reset(li_1);

		$.template_effect(() => {
			$.set_attribute(a_1, 'href', $.get(item).href);
			$.set_text(text_1, $.get(item).name);
		});

		$.append($$anchor, li_1);
	});

	$.reset(ul_1);
	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var node_4 = $.child(div_6);

	{
		let $0 = $.derived(() => cn(isScrolled && "lg:hidden"));

		Button(node_4, {
			variant: 'ghost',
			size: 'sm',
			get class() {
				return $.get($0);
			},
			href: '/',
			children: ($$anchor, $$slotProps) => {
				var span_2 = root_3();

				$.append($$anchor, span_2);
			},
			$$slots: { default: true }
		});
	}

	var node_5 = $.sibling(node_4, 2);

	{
		let $0 = $.derived(() => cn(isScrolled && "lg:hidden"));

		Button(node_5, {
			size: 'sm',
			get class() {
				return $.get($0);
			},
			href: '/',
			children: ($$anchor, $$slotProps) => {
				var span_3 = root_4();

				$.append($$anchor, span_3);
			},
			$$slots: { default: true }
		});
	}

	var node_6 = $.sibling(node_5, 2);

	{
		let $0 = $.derived(() => cn(isScrolled ? "lg:inline-flex" : "hidden"));

		Button(node_6, {
			size: 'sm',
			get class() {
				return $.get($0);
			},
			href: '/',
			children: ($$anchor, $$slotProps) => {
				var span_4 = root_5();

				$.append($$anchor, span_4);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div_6);
	$.reset(div_4);
	$.reset(div_1);
	$.reset(div);
	$.reset(nav);
	$.reset(header);

	$.template_effect(
		($0) => {
			$.set_attribute(nav, 'data-state', menuState ? "active" : undefined);
			$.set_class(nav, 1, $0);
			$.set_attribute(button, 'aria-label', menuState ? "Close Menu" : "Open Menu");
		},
		[
			() => $.clsx(cn("fixed z-20 w-full transition-all duration-300", isScrolled && "border-b border-black/5 bg-background/75 backdrop-blur-lg"))
		]
	);

	$.delegated('click', button, () => menuState = !menuState);
	$.append($$anchor, header);
	$.pop();
}

$.delegate(['click']);