import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "$lib/components/ui/button/button.svelte";
import { cn } from "$lib/utils";
import Menu from "@lucide/svelte/icons/menu";
import X from "@lucide/svelte/icons/x";
import ArrowRight from "@lucide/svelte/icons/arrow-right";
import ChevronRight from "@lucide/svelte/icons/chevron-right";
import { scrollY } from "svelte/reactivity/window";

import {
	Beacon,
	Bolt,
	Cisco,
	Claude,
	Figma,
	FirebaseFull,
	Hulu,
	Spotify,
	SupabaseFull,
	VercelFull
} from "$lib/svgs";

var root = $.from_html(`<li><a class="block text-muted-foreground duration-150 hover:text-accent-foreground"><span> </span></a></li>`);
var root_1 = $.from_html(`<header><nav class="fixed z-20 w-full px-2"><div><div class="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4"><div class="flex w-full justify-between lg:w-auto"><a href="/" aria-label="home" class="flex items-center space-x-2"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" role="img" color="currentColor"><path d="M22 18C22 19.4001 22 20.1002 21.7275 20.635C21.4878 21.1054 21.1054 21.4878 20.635 21.7275C20.1002 22 19.4001 22 18 22C16.5999 22 15.8998 22 15.365 21.7275C14.8946 21.4878 14.5122 21.1054 14.2725 20.635C14 20.1002 14 19.4001 14 18C14 16.5999 14 15.8998 14.2725 15.365C14.5122 14.8946 14.8946 14.5122 15.365 14.2725C15.8998 14 16.5999 14 18 14C19.4001 14 20.1002 14 20.635 14.2725C21.1054 14.5122 21.4878 14.8946 21.7275 15.365C22 15.8998 22 16.5999 22 18Z" stroke="currentColor" stroke-width="1.5"></path><path d="M22 10C22 11.4001 22 12.1002 21.7275 12.635C21.4878 13.1054 21.1054 13.4878 20.635 13.7275C20.1002 14 19.4001 14 18 14C16.5999 14 15.8998 14 15.365 13.7275C14.8946 13.4878 14.5122 13.1054 14.2725 12.635C14 12.1002 14 11.4001 14 10C14 8.59987 14 7.8998 14.2725 7.36502C14.5122 6.89462 14.8946 6.51217 15.365 6.27248C15.8998 6 16.5999 6 18 6C19.4001 6 20.1002 6 20.635 6.27248C21.1054 6.51217 21.4878 6.89462 21.7275 7.36502C22 7.8998 22 8.59987 22 10Z" stroke="currentColor" stroke-width="1.5"></path><path d="M14 18C14 19.4001 14 20.1002 13.7275 20.635C13.4878 21.1054 13.1054 21.4878 12.635 21.7275C12.1002 22 11.4001 22 10 22C8.59987 22 7.8998 22 7.36502 21.7275C6.89462 21.4878 6.51217 21.1054 6.27248 20.635C6 20.1002 6 19.4001 6 18C6 16.5999 6 15.8998 6.27248 15.365C6.51217 14.8946 6.89462 14.5122 7.36502 14.2725C7.8998 14 8.59987 14 10 14C11.4001 14 12.1002 14 12.635 14.2725C13.1054 14.5122 13.4878 14.8946 13.7275 15.365C14 15.8998 14 16.5999 14 18Z" stroke="currentColor" stroke-width="1.5"></path><path opacity="0.4" d="M10 6C10 7.40013 10 8.1002 9.72752 8.63497C9.48783 9.10538 9.10538 9.48783 8.63498 9.72752C8.1002 10 7.40013 10 6 10C4.59987 10 3.8998 10 3.36502 9.72751C2.89462 9.48783 2.51217 9.10538 2.27248 8.63497C2 8.10019 2 7.40013 2 6C2 4.59987 2 3.8998 2.27248 3.36502C2.51217 2.89462 2.89462 2.51217 3.36502 2.27248C3.8998 2 4.59987 2 6 2C7.40013 2 8.1002 2 8.63498 2.27248C9.10538 2.51217 9.48783 2.89462 9.72752 3.36502C10 3.8998 10 4.59987 10 6Z" stroke="currentColor" stroke-width="1.5"></path></svg></a> <button class="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"><!> <!></button></div> <div class="absolute inset-0 m-auto hidden size-fit lg:block"><ul class="flex gap-8 text-sm"></ul></div> <div><div class="lg:hidden"><ul class="space-y-6 text-base"></ul></div> <div class="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit"><!> <!> <!></div></div></div></div></nav></header>`);

var root_2 = $.from_html(`<div><!> <main class="overflow-hidden"><div class="absolute inset-0 isolate hidden opacity-65 contain-strict lg:block"><div class="absolute top-0 left-0 h-320 w-140 -translate-y-87.5 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]"></div> <div class="absolute top-0 left-0 h-320 w-60 [translate:5%_-50%] -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]"></div> <div class="absolute top-0 left-0 h-320 w-60 -translate-y-87.5 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]"></div></div> <section><div class="relative pt-24 md:pt-36"><div class="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]"></div> <div class="mx-auto max-w-7xl px-6"><div class="text-center sm:mx-auto lg:mt-0 lg:mr-auto"><div><a href="#link" class="group mx-auto flex w-fit items-center gap-4 rounded-full border bg-muted p-1 pl-4 shadow-md shadow-zinc-950/5 transition-colors duration-300 hover:bg-background dark:border-t-white/5 dark:shadow-zinc-950 dark:hover:border-t-border"><span class="text-sm text-foreground">Introducing Support for AI Models</span> <span class="block h-4 w-0.5 border-l bg-white dark:border-background dark:bg-zinc-700"></span> <div class="size-6 overflow-hidden rounded-full bg-background duration-500 group-hover:bg-muted"><div class="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0"><span class="flex size-6"><!></span> <span class="flex size-6"><!></span></div></div></a></div> <h1 class="mt-8 text-6xl text-balance md:text-7xl lg:mt-16 xl:text-[5.25rem]">Modern Solutions for Customer Engagement</h1> <p class="mx-auto mt-8 max-w-2xl text-lg text-balance">Highly customizable components for building modern websites and
							applications that look and feel the way you mean it.</p> <div class="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row"><div class="border bg-foreground/10 p-0.5" style="border-radius: calc(0.5rem + 0.125rem + 4px);"><!></div> <!></div></div></div> <div class="relative mt-8 -mr-56 overflow-hidden px-2 sm:mt-12 sm:mr-0 md:mt-20"><div class="absolute inset-0 z-10 bg-linear-to-b from-transparent from-35% to-background"></div> <div class="relative mx-auto max-w-6xl overflow-hidden rounded-2xl border bg-background p-4 shadow-lg inset-shadow-2xs shadow-zinc-950/15 ring-background dark:inset-shadow-white/20"><img class="relative hidden aspect-15/8 rounded-2xl bg-background dark:block" src="/mail2.png" alt="app screen" width="2700" height="1440"/> <img class="relative z-2 aspect-15/8 rounded-2xl border border-border/25 dark:hidden" src="/mail2-light.png" alt="app screen" width="2700" height="1440"/></div></div></div></section> <section class="bg-background pt-16 pb-16 md:pb-32"><div class="group relative m-auto max-w-5xl px-6"><div class="absolute inset-0 z-10 flex scale-95 items-center justify-center opacity-0 duration-500 group-hover:scale-100 group-hover:opacity-100"><a href="/" class="block text-sm duration-150 hover:opacity-75"><span>Meet Our Customers</span> <!></a></div> <div class="mx-auto mt-12 grid max-w-2xl grid-cols-3 gap-x-12 gap-y-8 transition-all duration-500 **:fill-foreground group-hover:opacity-50 group-hover:blur-xs sm:gap-x-16 sm:gap-y-14 md:grid-cols-4"><div class="flex items-center"><!></div> <div class="flex items-center"><!></div> <div class="flex items-center"><!></div> <div class="flex items-center"><!></div> <div class="flex items-center"><!></div> <div class="flex items-center"><!></div> <div class="flex items-center"><!></div> <div class="flex items-center"><!></div></div></div></section></main></div>`);

export default function Hero_one($$anchor, $$props) {
	$.push($$props, true);

	const // Shadcn Svelte UI Button Component
	// You can store Hero Header Component in seperate file
	// I have used snippet for better readability
	// Hero Header Component
	heroheader = ($$anchor) => {
		var header = root_1();
		var nav = $.child(header);
		var div = $.child(nav);
		var div_1 = $.child(div);
		var div_2 = $.child(div_1);
		var button = $.sibling($.child(div_2), 2);
		var node = $.child(button);

		{
			let $0 = $.derived(() => [
				"m-auto size-6 duration-200",
				$.get(menuState) && "scale-0 rotate-180 opacity-0"
			]);

			Menu(node, {
				get class() {
					return $.get($0);
				}
			});
		}

		var node_1 = $.sibling(node, 2);

		{
			let $0 = $.derived(() => [
				"absolute inset-0 m-auto size-6 scale-0 -rotate-180 opacity-0 duration-200",
				$.get(menuState) && "scale-100 rotate-0 opacity-100"
			]);

			X(node_1, {
				get class() {
					return $.get($0);
				}
			});
		}

		$.reset(button);
		$.reset(div_2);

		var div_3 = $.sibling(div_2, 2);
		var ul = $.child(div_3);

		$.each(ul, 21, () => menuItems, $.index, ($$anchor, item) => {
			var li = root();
			var a = $.child(li);
			var span = $.child(a);
			var text = $.only_child(span, true);

			$.reset(a);
			$.reset(li);

			$.template_effect(() => {
				$.set_attribute(a, 'href', $.get(item).href);
				$.set_text(text, $.get(item).name);
			});

			$.append($$anchor, li);
		});

		$.reset(ul);
		$.reset(div_3);

		var div_4 = $.sibling(div_3, 2);
		var div_5 = $.child(div_4);
		var ul_1 = $.child(div_5);

		$.each(ul_1, 21, () => menuItems, $.index, ($$anchor, item) => {
			var li_1 = root();
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
		var node_2 = $.child(div_6);

		{
			let $0 = $.derived(() => cn($.get(isScrolled) && "lg:hidden"));

			Button(node_2, {
				variant: 'outline',
				size: 'sm',
				get class() {
					return $.get($0);
				},
				href: '/',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Login');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});
		}

		var node_3 = $.sibling(node_2, 2);

		{
			let $0 = $.derived(() => cn($.get(isScrolled) && "lg:hidden"));

			Button(node_3, {
				href: '/',
				size: 'sm',
				get class() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Sign Up');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});
		}

		var node_4 = $.sibling(node_3, 2);

		{
			let $0 = $.derived(() => cn($.get(isScrolled) ? "lg:inline-flex" : "hidden"));

			Button(node_4, {
				size: 'sm',
				href: '/',
				get class() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Get Strated');

					$.append($$anchor, text_4);
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

		$.template_effect(() => {
			$.set_class(div, 1, $.clsx([
				"mx-auto mt-2 max-w-6xl rounded-2xl px-6 transition-all duration-300 lg:px-12",
				$.get(isScrolled) && "max-w-4xl rounded-2xl border bg-background/50 backdrop-blur-lg lg:px-5"
			]));

			$.set_attribute(button, 'aria-label', $.get(menuState) == true ? "Close Menu" : "Open Menu");

			$.set_class(div_4, 1, $.clsx([
				"mb-6 w-full  flex-wrap items-center justify-end space-y-8 rounded-3xl border bg-background p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent",
				$.get(menuState) ? "block lg:flex" : "hidden lg:flex"
			]));
		});

		$.delegated('click', button, () => $.set(menuState, !$.get(menuState)));
		$.append($$anchor, header);
	};

	let menuItems = [
		{ name: "Features", href: "#a" },
		{ name: "Solution", href: "#a" },
		{ name: "Pricing", href: "#a" },
		{ name: "About", href: "#a" }
	];

	let menuState = $.state(false);

	let isScrolled = $.derived(() => {
		if (scrollY.current !== undefined && scrollY.current > 50) {
			return true;
		}

		return false;
	});

	var div_7 = root_2();
	var node_5 = $.child(div_7);

	heroheader(node_5);

	var main = $.sibling(node_5, 2);
	var section = $.sibling($.child(main), 2);
	var div_8 = $.child(section);
	var div_9 = $.sibling($.child(div_8), 2);
	var div_10 = $.child(div_9);
	var div_11 = $.child(div_10);
	var a_2 = $.child(div_11);
	var div_12 = $.sibling($.child(a_2), 4);
	var div_13 = $.child(div_12);
	var span_2 = $.child(div_13);
	var node_6 = $.child(span_2);

	ArrowRight(node_6, { class: 'm-auto size-3' });
	$.reset(span_2);

	var span_3 = $.sibling(span_2, 2);
	var node_7 = $.child(span_3);

	ArrowRight(node_7, { class: 'm-auto size-3' });
	$.reset(span_3);
	$.reset(div_13);
	$.reset(div_12);
	$.reset(a_2);
	$.reset(div_11);

	var div_14 = $.sibling(div_11, 6);
	var div_15 = $.child(div_14);
	var node_8 = $.child(div_15);

	Button(node_8, {
		href: '/',
		size: 'lg',
		class: 'rounded-xl px-5 text-base',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Start Building');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	$.reset(div_15);

	var node_9 = $.sibling(div_15, 2);

	Button(node_9, {
		size: 'lg',
		variant: 'ghost',
		class: 'rounded-xl px-5',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_6 = $.text('Request a demo');

			$.append($$anchor, text_6);
		},
		$$slots: { default: true }
	});

	$.reset(div_14);
	$.reset(div_10);
	$.reset(div_9);
	$.next(2);
	$.reset(div_8);
	$.reset(section);

	var section_1 = $.sibling(section, 2);
	var div_16 = $.child(section_1);
	var div_17 = $.child(div_16);
	var a_3 = $.child(div_17);
	var node_10 = $.sibling($.child(a_3), 2);

	ChevronRight(node_10, { class: 'ml-1 inline-block size-3' });
	$.reset(a_3);
	$.reset(div_17);

	var div_18 = $.sibling(div_17, 2);
	var div_19 = $.child(div_18);
	var node_11 = $.child(div_19);

	Bolt(node_11, { class: 'mx-auto h-5 w-full' });
	$.reset(div_19);

	var div_20 = $.sibling(div_19, 2);
	var node_12 = $.child(div_20);

	VercelFull(node_12, { class: 'mx-auto h-4 w-full' });
	$.reset(div_20);

	var div_21 = $.sibling(div_20, 2);
	var node_13 = $.child(div_21);

	SupabaseFull(node_13, { class: 'mx-auto h-6' });
	$.reset(div_21);

	var div_22 = $.sibling(div_21, 2);
	var node_14 = $.child(div_22);

	Hulu(node_14, { class: 'mx-auto h-4 w-full' });
	$.reset(div_22);

	var div_23 = $.sibling(div_22, 2);
	var node_15 = $.child(div_23);

	Spotify(node_15, { class: 'mx-auto h-6 w-full' });
	$.reset(div_23);

	var div_24 = $.sibling(div_23, 2);
	var node_16 = $.child(div_24);

	FirebaseFull(node_16, { class: 'mx-auto h-6 w-full' });
	$.reset(div_24);

	var div_25 = $.sibling(div_24, 2);
	var node_17 = $.child(div_25);

	Beacon(node_17, { class: 'mx-auto h-4 w-full' });
	$.reset(div_25);

	var div_26 = $.sibling(div_25, 2);
	var node_18 = $.child(div_26);

	Claude(node_18, { class: 'mx-auto h-5 w-full' });
	$.reset(div_26);
	$.reset(div_18);
	$.reset(div_16);
	$.reset(section_1);
	$.reset(main);
	$.reset(div_7);
	$.append($$anchor, div_7);
	$.pop();
}

$.delegate(['click']);