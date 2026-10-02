import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Marquee } from "$lib/components/magic/marquee";
import { ProgressiveBlur } from "$lib/components/magic/progressive-blur";
import Button from "$lib/components/ui/button/button.svelte";
import { cn } from "$lib/utils";
import ChevronRight from "@lucide/svelte/icons/chevron-right";
import Menu from "@lucide/svelte/icons/menu";
import X from "@lucide/svelte/icons/x";
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
var root_1 = $.from_html(`<header><nav class="fixed z-20 w-full px-2"><div><div><div class="flex w-full items-center justify-between gap-12 lg:w-auto"><a href="/" aria-label="home" class="flex items-center space-x-2"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" role="img" color="currentColor"><path d="M22 18C22 19.4001 22 20.1002 21.7275 20.635C21.4878 21.1054 21.1054 21.4878 20.635 21.7275C20.1002 22 19.4001 22 18 22C16.5999 22 15.8998 22 15.365 21.7275C14.8946 21.4878 14.5122 21.1054 14.2725 20.635C14 20.1002 14 19.4001 14 18C14 16.5999 14 15.8998 14.2725 15.365C14.5122 14.8946 14.8946 14.5122 15.365 14.2725C15.8998 14 16.5999 14 18 14C19.4001 14 20.1002 14 20.635 14.2725C21.1054 14.5122 21.4878 14.8946 21.7275 15.365C22 15.8998 22 16.5999 22 18Z" stroke="currentColor" stroke-width="1.5"></path><path d="M22 10C22 11.4001 22 12.1002 21.7275 12.635C21.4878 13.1054 21.1054 13.4878 20.635 13.7275C20.1002 14 19.4001 14 18 14C16.5999 14 15.8998 14 15.365 13.7275C14.8946 13.4878 14.5122 13.1054 14.2725 12.635C14 12.1002 14 11.4001 14 10C14 8.59987 14 7.8998 14.2725 7.36502C14.5122 6.89462 14.8946 6.51217 15.365 6.27248C15.8998 6 16.5999 6 18 6C19.4001 6 20.1002 6 20.635 6.27248C21.1054 6.51217 21.4878 6.89462 21.7275 7.36502C22 7.8998 22 8.59987 22 10Z" stroke="currentColor" stroke-width="1.5"></path><path d="M14 18C14 19.4001 14 20.1002 13.7275 20.635C13.4878 21.1054 13.1054 21.4878 12.635 21.7275C12.1002 22 11.4001 22 10 22C8.59987 22 7.8998 22 7.36502 21.7275C6.89462 21.4878 6.51217 21.1054 6.27248 20.635C6 20.1002 6 19.4001 6 18C6 16.5999 6 15.8998 6.27248 15.365C6.51217 14.8946 6.89462 14.5122 7.36502 14.2725C7.8998 14 8.59987 14 10 14C11.4001 14 12.1002 14 12.635 14.2725C13.1054 14.5122 13.4878 14.8946 13.7275 15.365C14 15.8998 14 16.5999 14 18Z" stroke="currentColor" stroke-width="1.5"></path><path opacity="0.4" d="M10 6C10 7.40013 10 8.1002 9.72752 8.63497C9.48783 9.10538 9.10538 9.48783 8.63498 9.72752C8.1002 10 7.40013 10 6 10C4.59987 10 3.8998 10 3.36502 9.72751C2.89462 9.48783 2.51217 9.10538 2.27248 8.63497C2 8.10019 2 7.40013 2 6C2 4.59987 2 3.8998 2.27248 3.36502C2.51217 2.89462 2.89462 2.51217 3.36502 2.27248C3.8998 2 4.59987 2 6 2C7.40013 2 8.1002 2 8.63498 2.27248C9.10538 2.51217 9.48783 2.89462 9.72752 3.36502C10 3.8998 10 4.59987 10 6Z" stroke="currentColor" stroke-width="1.5"></path></svg></a> <button class="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"><!> <!></button></div> <div class="absolute inset-0 m-auto hidden size-fit lg:block"><ul class="flex gap-8 text-sm"></ul></div> <div><div class="lg:hidden"><ul class="space-y-6 text-base"></ul></div> <div class="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit"><!> <!> <!></div></div></div></div></nav></header>`);
var root_2 = $.from_html(`Start Building <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

var root_4 = $.from_html(
	`<!> <main class="overflow-x-hidden"><section><div class="py-24 md:pb-32 lg:pt-72 lg:pb-36"><div class="relative mx-auto flex max-w-7xl flex-col px-6 lg:block lg:px-12"><div class="mx-auto max-w-lg text-center lg:ml-0 lg:max-w-full lg:text-left"><h1 class="mt-8 max-w-2xl text-5xl text-balance md:text-6xl lg:mt-16 xl:text-7xl">Build 10x Faster with NS</h1> <p class="mt-8 max-w-2xl text-lg text-balance">Highly customizable components for building modern websites and applications
						you mean it.</p> <div class="mt-12 flex flex-col items-center justify-center gap-2 sm:flex-row lg:justify-start"><!> <!></div></div></div></div></section> <section class="bg-background py-6"><div class="group relative m-auto max-w-7xl px-6"><div class="flex flex-col items-center md:flex-row"><div class="md:max-w-44 md:border-r md:pr-6"><p class="text-end text-sm">Powering the best teams</p></div> <div class="relative py-6 **:fill-foreground md:w-[calc(100%-11rem)]"><!> <div class="absolute inset-y-0 left-0 w-20 bg-linear-to-r from-background"></div> <div class="absolute inset-y-0 right-0 w-20 bg-linear-to-l from-background"></div> <!> <!></div></div></div></section></main>`,
	1
);

export default function Hero_five($$anchor, $$props) {
	$.push($$props, true);

	const // You can store Hero Header Component in seperate file
	// I have used snippet for better readability
	// Hero Header Component
	heroHeader = ($$anchor) => {
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
				"mx-auto max-w-7xl rounded-3xl px-6 transition-all duration-300 lg:px-12",
				$.get(isScrolled) && "bg-background/50 backdrop-blur-2xl"
			]));

			$.set_class(div_1, 1, $.clsx([
				"relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4",
				$.get(isScrolled) && "lg:py-4"
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

	var fragment = root_4();
	var node_5 = $.first_child(fragment);

	heroHeader(node_5);

	var main = $.sibling(node_5, 2);
	var section = $.child(main);
	var div_7 = $.child(section);
	var div_8 = $.child(div_7);
	var div_9 = $.child(div_8);
	var div_10 = $.sibling($.child(div_9), 4);
	var node_6 = $.child(div_10);

	Button(node_6, {
		size: 'lg',
		href: '/',
		class: 'h-12 rounded-full pr-3 pl-5 text-base',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root_2();
			var node_7 = $.sibling($.first_child(fragment_1));

			ChevronRight(node_7, { class: 'ml-1' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_6, 2);

	Button(node_8, {
		size: 'lg',
		variant: 'ghost',
		href: '/',
		class: 'h-12 rounded-full px-5 text-base hover:bg-zinc-950/5 dark:hover:bg-white/5',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Request a demo');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	$.reset(div_10);
	$.reset(div_9);
	$.reset(div_8);
	$.reset(div_7);
	$.reset(section);

	var section_1 = $.sibling(section, 2);
	var div_11 = $.child(section_1);
	var div_12 = $.child(div_11);
	var div_13 = $.sibling($.child(div_12), 2);
	var node_9 = $.child(div_13);

	Marquee(node_9, {
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_3();
			var node_10 = $.first_child(fragment_2);

			Bolt(node_10, { height: 22, width: 56 });

			var node_11 = $.sibling(node_10, 2);

			VercelFull(node_11, { height: 22, width: 84 });

			var node_12 = $.sibling(node_11, 2);

			SupabaseFull(node_12, { class: 'h-6' });

			var node_13 = $.sibling(node_12, 2);

			Hulu(node_13, { height: 18, width: 56 });

			var node_14 = $.sibling(node_13, 2);

			Spotify(node_14, { height: 24, width: 80 });

			var node_15 = $.sibling(node_14, 2);

			FirebaseFull(node_15, { height: 24, width: 80 });

			var node_16 = $.sibling(node_15, 2);

			Beacon(node_16, { height: 24, width: 80 });

			var node_17 = $.sibling(node_16, 2);

			Claude(node_17, { height: 26, width: 90 });

			var node_18 = $.sibling(node_17, 2);

			Figma(node_18, { height: 24, width: 24 });

			var node_19 = $.sibling(node_18, 2);

			Cisco(node_19, { height: 30, width: 60 });
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_20 = $.sibling(node_9, 6);

	ProgressiveBlur(node_20, {
		class: 'pointer-events-none absolute top-0 left-0 z-50 h-full w-20',
		direction: 'left',
		blurIntensity: 1
	});

	var node_21 = $.sibling(node_20, 2);

	ProgressiveBlur(node_21, {
		class: 'pointer-events-none absolute top-0 right-0 z-50 h-full w-20',
		direction: 'right',
		blurIntensity: 1
	});

	$.reset(div_13);
	$.reset(div_12);
	$.reset(div_11);
	$.reset(section_1);
	$.reset(main);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);